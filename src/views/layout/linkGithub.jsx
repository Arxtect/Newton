/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-06 21:26:51
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
import { removeDirectory } from "domain/filesystem"

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

const LinkGithub = ({ dialogOpen, setDialogOpen, setIsExistsGit }) => {
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(false)

  const [messages, setMessages] = useState("");
  const [progress, setProgress] = useState(0);
  const { currentProjectRoot } = useFileStore((state) => ({
    currentProjectRoot: state.currentProjectRoot,
  }));
  const { initializeGitStatus } = useGitRepo();

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
    }).then((res) => {
      setDialogOpen(false);
      toast.success("Link repository success from github");
      setIsExistsGit(true);
      initializeGitStatus({ projectRoot: currentProjectRoot });
      setLoading(false);
    }).catch((error) => {
      toast.warning(error.message);
      setLoading(false);
      removeDirectory(path.join(currentProjectRoot, ".git"))
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

  return (
    <ArDialog
      title="Link Remote Github Repository"
      dialogOpen={dialogOpen}
      handleCancel={handleCancelProject}
      tooltipText={"Ensure that the remote repository is empty when you link it"}
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
  );
};

export default LinkGithub;
