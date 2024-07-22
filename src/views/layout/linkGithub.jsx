/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-06 21:26:51
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Button, Menu, MenuItem, Tooltip } from "@mui/material";
import ArDialog from "@/components/arDialog";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Box,
  CircularProgress,
  LinearProgress,
} from "@mui/material";
import { useFileStore, useGitRepo } from "store";
import { toast } from "react-toastify";
import ArTextField from "@/components/arTextField";
import path from "path";
import { setupAndPushToRepo } from "domain/git";
import { removeDirectory, existsPath } from "domain/filesystem";
import BottomDrawer from "@/features/bottomDrawer/bottomDrawer";
import share from "@/assets/share.svg";

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
  const { currentProjectRoot } = useFileStore((state) => ({
    currentProjectRoot: state.currentProjectRoot,
  }));
  const { initializeGitStatus } = useGitRepo();

  const getIsExistGit = async () => {
    const isExistsGit = await existsPath(path.join(currentProjectRoot, ".git"));
    setIsExistsGit(isExistsGit);
  };

  useEffect(() => {
    getIsExistGit();
  }, [currentProjectRoot]);

  const {
    committerName,
    committerEmail,
    githubApiToken,
    changeConfig,
    corsProxy,
  } = useGitRepo((state) => ({
    committerName: state.committerName,
    committerEmail: state.committerEmail,
    githubApiToken: state.githubApiToken,
    changeConfig: state.changeConfig,
    corsProxy: state.corsProxy,
  }));

  const [gitConfig, setGitConfig] = useState({
    committerName: committerName,
    committerEmail: committerEmail,
    githubApiToken: githubApiToken,
  });

  const handleCancelProject = () => {
    setDialogOpen(false);
  };
  const handleSaveProject = () => {
    setLoading(true);
    if (!projectName) {
      setLoading(false);
      toast.warning("Please enter remote repository url");
      return;
    }
    if (
      gitConfig.committerName &&
      gitConfig.committerEmail &&
      gitConfig.githubApiToken
    ) {
      changeConfig({
        committerName: gitConfig.committerName,
        committerEmail: gitConfig.committerEmail,
        githubApiToken: gitConfig.githubApiToken,
      });
    } else {
      setLoading(false);
      toast.warning("Please enter git config");
      return;
    }
    setupAndPushToRepo(currentProjectRoot, projectName, {
      singleBranch: false,
      corsProxy: corsProxy,
      token: gitConfig.githubApiToken,
      committerName: gitConfig.committerName,
      committerEmail: gitConfig.committerEmail,
      onProgress,
      onMessage,
    })
      .then((res) => {
        setDialogOpen(false);
        toast.success("Link repository success from github");
        setIsExistsGit(true);
        initializeGitStatus({ projectRoot: currentProjectRoot });
        setLoading(false);
      })
      .catch((error) => {
        toast.warning(error.message);
        setLoading(false);
        removeDirectory(path.join(currentProjectRoot, ".git"));
      });
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

  return (
    <React.Fragment>
      {!!isExistsGit ? (
        <Tooltip title="Sync">
          {/* <Button
            color="inherit"
            aria-label="log"
            size="small"
            onClick={() => toggleDrawer(true)}
          >
            <span className="flex items-center justify-center w-[20px] h-[20px] text-[14px]">
              sync
            </span>
          </Button> */}
          <button
            className={`flex items-center text-gray-700 px-2 py-1 hover:bg-gray-200 active:bg-[#9fd5a2] space-x-1 `}
            onClick={() => toggleDrawer(true)}
          >
            <img src={share} alt="" className="w-4 h-4" />
            <span>Sync</span>
          </button>

        </Tooltip>
      ) : (
        <Tooltip title="Link a git repository">
          {/* <Button
            color="inherit"
            aria-label="log"
            size="small"
            onClick={() => setDialogOpen(true)}
          >
            <span className="flex items-center justify-center w-[20px] h-[20px] text-[14px]">
              Link
            </span>
          </Button> */}
          <button
            className={`flex items-center text-gray-700 px-2 py-1 hover:bg-gray-200 active:bg-[#9fd5a2] space-x-1 `}
            onClick={() => setDialogOpen(true)}
          >
            <img src={share} alt="" className="w-4 h-4" />
            <span>Link</span>
          </button>
        </Tooltip>
      )}
      <ArDialog
        title="Link Remote Github Repository"
        dialogOpen={dialogOpen}
        handleCancel={handleCancelProject}
        tooltipText={
          "Ensure that the remote repository is empty when you link it"
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
              label="Remote Repository Url"
              placeholder="please input remote repository url"
              defaultValue={""}
              onChange={(event) => {
                setProjectName(event.target.value);
              }}
              margin="normal"
              fullWidth
              className="my-3"
              inputSize="middle"
            />
            {progress > 0 && (
              <GithubProgressBar progress={progress} messages={messages} />
            )}
          </div>
          {!committerName && (
            <div className="w-[100%]">
              <ArTextField
                label="Git: Committer Name"
                placeholder="Your committer name"
                defaultValue={committerName}
                onChange={(event) => {
                  setGitConfig({
                    ...gitConfig,
                    committerName: event.target.value,
                  });
                }}
                sx={{ width: "100%" }}
                className="my-3"
                inputSize="middle"
              />
            </div>
          )}
          {!committerEmail && (
            <div className="w-[100%]">
              <ArTextField
                label="Git: Committer Email"
                variant="outlined"
                placeholder="Your email"
                defaultValue={committerEmail}
                onChange={(event) =>
                  setGitConfig({
                    ...gitConfig,
                    committerEmail: event.target.value,
                  })
                }
                sx={{ width: "100%" }}
                className="my-3"
                inputSize="middle"
              />
            </div>
          )}

          {!githubApiToken && (
            <div className="w-[100%]">
              <ArTextField
                label="GitHub: Private Access Token"
                variant="outlined"
                defaultValue={githubApiToken}
                onChange={(event) =>
                  setGitConfig({
                    ...gitConfig,
                    githubApiToken: event.target.value,
                  })
                }
                className="my-3"
                sx={{ width: "100%" }}
                inputSize="middle"
              />
            </div>
          )}
        </Box>
      </ArDialog>
      <BottomDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} />
    </React.Fragment>
  );
};

export default LinkGithub;
