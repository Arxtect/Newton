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
import { cloneRepository } from "domain/git";

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

const ImportGithub = ({ dialogOpen, setDialogOpen, getProjectList }) => {
  const [projectName, setProjectName] = useState(
    "https://github.com/devixyz/example.git"
  );
  const [messages, setMessages] = useState("");
  const [progress, setProgress] = useState(0);
  const { copyProject } = useFileStore((state) => ({
    copyProject: state.copyProject,
  }));

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
      toast.warning("Please enter project name");
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
    gitClone(projectName)
      .then((res) => {
        console.log(res);
        getProjectList();
        setLoading(false);
        setDialogOpen(false);
        toast.success("Import success from github");
      })
      .catch((error) => {
        setLoading(false);
        toast.warning(error.message);
      });
  };

  const onProgress = (progress) => {
    // lengthComputable: true;
    // loaded: 7;
    // total: 23;
    const rate = progress.loaded / progress.total;
    setProgress(rate > 1 ? 1 : rate);
    console.log(progress);
  };
  const onMessage = (message) => {
    setMessages(message);
    console.log(message, "message");
  };
  const gitClone = async (clonePath) => {
    const match = clonePath.match(/github\.com\/(.+?)\/(.+?)\.git$/);
    if (!match) {
      toast.warning("Invalid repository URL");
      return;
    }

    const user = match[1];
    const repo = match[2];
    const destPath = path.join("/", repo);
    console.log(destPath, "destPath");

    return await cloneRepository(destPath, clonePath, {
      singleBranch: false,
      corsProxy: corsProxy,
      token: gitConfig.githubApiToken,
      onProgress,
      onMessage,
    });
  };
  const [loading, setLoading] = useState(false);

  return (
    <ArDialog
      title="Import From Github"
      dialogOpen={dialogOpen}
      handleCancel={handleCancelProject}
      buttonList={[
        { title: "Cancel", click: handleCancelProject },
        { title: "Save", click: handleSaveProject, loading: loading },
      ]}
      width={"50vw"}
    >
      <Box component="form" noValidate autoComplete="off">
        <div className="w-[100%]">
          <ArTextField
            label="Github Repository Url"
            placeholder="please input github repository url"
            defaultValue={projectName}
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

export default ImportGithub;
