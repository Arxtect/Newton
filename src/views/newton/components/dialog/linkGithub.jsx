/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-06 21:26:51
 */
import React, { useEffect, useState } from "react";
import Tooltip from "@/components/tooltip";

import ArDialog from "@/components/arDialog";
import {
  Typography,
  Box,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { useFileStore, useGitRepo, useUserStore } from "store";
import { toast } from "react-toastify";
import ArTextField from "@/components/arTextField";
import path from "path";
import { setupAndPushToRepo } from "domain/git";
import { existsPath, removeParentDirPath } from "domain/filesystem";
import BottomDrawer from "@/features/bottomDrawer/bottomDrawer";
import ArIcon from "@/components/arIcon";

import { getGitToken, createGitRepo, deleteGitRepo } from "@/services";
import { getGiteaFullUrl, formatRepoName } from "@/utils";

const GithubProgressBar = ({ progress, messages }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      mt={1}
      border="1px solid lightgray"
      borderRadius="4px"
      position="relative"
    >
      <Box width="100%" position="absolute" top={0} left={0}>
        <LinearProgress
          variant="determinate"
          value={progress * 100}
          className="color-[#176cd0] h-[2px]"
        />
      </Box>
      <Box display="flex" p={1.5}>
        <CircularProgress size={20} thickness={5} className="color-[#176cd0]" />
        <Typography variant="body2" ml={1}>
          {messages}
        </Typography>
      </Box>
    </Box>
  );
};

const LinkGithub = (props) => {
  // link
  const [dialogOpen, setDialogOpen] = useState(false);

  // sync
  const [isExistsGit, setIsExistsGit] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState("");
  const [progress, setProgress] = useState(0);
  const { currentProjectRoot, parentDir } = useFileStore((state) => ({
    currentProjectRoot: state.currentProjectRoot,
    parentDir: state.parentDir,
  }));
  const { initializeGitStatus, deleteGitFolder } = useGitRepo();

  const getIsExistGit = async () => {
    const isExistsGit = await existsPath(path.join(currentProjectRoot, ".git"));
    setIsExistsGit(isExistsGit);
  };

  useEffect(() => {
    getIsExistGit();
  }, [currentProjectRoot]);

  const { githubApiToken, changeConfig, corsProxy } = useGitRepo((state) => ({
    githubApiToken: state.githubApiToken,
    changeConfig: state.changeConfig,
    corsProxy: state.corsProxy,
  }));

  const { user } = useUserStore((state) => ({
    user: state.user,
  }));

  const [gitConfig, setGitConfig] = useState({
    githubApiToken: githubApiToken,
  });

  const handleCancelProject = () => {
    setDialogOpen(false);
  };
  const handleSaveProject = async () => {
    try {
      setLoading(true);

      if (!user?.id) {
        toast.warning("Please log in first");
        setLoading(false);
        return;
      }

      if (!projectName) {
        setLoading(false);
        toast.warning("Please enter the remote repository URL");
        return;
      }

      const res = await createGitRepo(projectName, projectName);

      if (!res || res?.error) {
        setLoading(false);
        setDialogOpen(false);
        console.log(res?.error, "res.error"); // Debug information
        // throw new Error(res?.error || "Failed to create Git repository");
        return;
      }

      let userName = user?.name;
      let remoteUrl = getGiteaFullUrl(userName, projectName);
      console.log(remoteUrl);

      const relativePath = removeParentDirPath(currentProjectRoot, parentDir);

      let result = await setupAndPushToRepo(relativePath, remoteUrl, {
        singleBranch: false,
        token: gitConfig.githubApiToken,
        onProgress,
        onMessage,
        committerName: userName,
        committerEmail: user?.email,
      });
      console.log(result, "result");

      if (result) {
        setDialogOpen(false);
        toast.success("Successfully linked repository from GitHub");
        setIsExistsGit(true);
        initializeGitStatus({ projectRoot: currentProjectRoot });
        setLoading(false);
      }
    } catch (err) {
      console.error(err); // Debug information
      toast.warning(err.message || err);
      setLoading(false);
      await deleteGitFolder({ projectRoot: currentProjectRoot });
      await handleDeleteGitRepo(projectName);
    }
  };

  const handleDeleteGitRepo = async (deleteProjectName) => {
    await deleteGitRepo(deleteProjectName);
  };

  const onProgress = (progress) => {
    const rate = progress.loaded / progress.total;
    setProgress(rate > 1 ? 1 : rate);
    console.log(progress);
  };
  const onMessage = (message) => {
    setMessages(message);
    console.log(message, "message");
  };

  //git control
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = (open) => {
    setIsOpen(open);
  };

  const getGiteaToekn = async (token) => {
    try {
      let res = await getGitToken(token);
      changeConfig({
        githubApiToken: res?.data,
      });
      return res.data;
    } catch (err) {
      changeConfig({ githubApiToken: "" });
    }
  };

  useEffect(() => {
    if (!dialogOpen) {
      setMessages("");
      setProgress(0);
      return;
    }
    if (!user?.id) {
      toast.warning("Plaese login first");
    }

    const relativePath = removeParentDirPath(currentProjectRoot, parentDir);
    console.log(currentProjectRoot, "currentProjectRoot");
    setProjectName(formatRepoName(relativePath));
    getGiteaToekn(githubApiToken);
  }, [dialogOpen]);

  useEffect(() => {
    if (isOpen) {
      getGiteaToekn(githubApiToken);
    }
  }, [isOpen]);

  return (
    <React.Fragment>
      {!!isExistsGit ? (
        <Tooltip content="Sync" position="bottom">
          <button
            className={`flex items-center text-gray-700 px-2 py-1 hover:bg-gray-200 active:bg-[#9fd5a2] space-x-1 `}
            onClick={() => toggleDrawer(true)}
          >
            <ArIcon
              name={"GitCloud"}
              className="text-black w-[1.1rem] h-[1.1rem]"
            />
            <span className="font-arx">Sync</span>
          </button>
        </Tooltip>
      ) : (
        <Tooltip content="Link a git repository" position="bottom">
          <button
            className={`flex items-center text-gray-700 px-2 py-1 hover:bg-gray-200 active:bg-[#9fd5a2] space-x-1 `}
            onClick={() => setDialogOpen(true)}
          >
            <ArIcon
              name={"GitCloud"}
              className="text-black w-[1.1rem] h-[1.1rem]"
            />
            <span className="font-arx">Sync</span>
          </button>
        </Tooltip>
      )}
      <ArDialog
        title="Sync Remote Cloud Repository"
        dialogOpen={dialogOpen}
        handleCancel={handleCancelProject}
        tooltipText={
          "Special characters detected and will be replaced with underscores '_'. Please modify the repo name if you do not want underscores"
        }
        buttonList={[
          { title: "Cancel", click: handleCancelProject },
          { title: "Save", click: handleSaveProject, loading: loading },
        ]}
        width={"50vw"}
      >
        <Box component="form" noValidate autoComplete="off">
          <div className="w-[100%]">
            <ArTextField
              label="Remote Repository Name"
              placeholder="please input remote repository name"
              value={projectName}
              onChange={(event) => {
                setProjectName(event.target.value);
              }}
              // InputProps={{
              //   readOnly: true,
              // }}
              margin="normal"
              fullWidth
              className="my-3"
              inputSize="middle"
            />
            {progress > 0 && (
              <GithubProgressBar progress={progress} messages={messages} />
            )}
          </div>
        </Box>
      </ArDialog>
      <BottomDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} />
    </React.Fragment>
  );
};

export default LinkGithub;
