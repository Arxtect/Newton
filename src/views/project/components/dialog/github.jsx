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
import { useFileStore, useGitRepo, useUserStore } from "store";
import { toast } from "react-toastify";
import ArTextField from "@/components/arTextField";
import ArSelect from "@/components/arSelect";

import path from "path";
import { cloneRepository } from "domain/git";
import {
  createProjectInfo,
  existsPath,
  removeDirectory,
} from "domain/filesystem";
import { getGitToken, getGitRepoList } from "@/services";

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

const ImportGithub = ({
  dialogOpen,
  setDialogOpen,
  getProjectList,
  user,
  projectName,
  setProjectName,
}) => {
  const [messages, setMessages] = useState("");
  const [progress, setProgress] = useState(0);
  const { githubApiToken, changeConfig } = useGitRepo((state) => ({
    githubApiToken: state.githubApiToken,
    changeConfig: state.changeConfig,
  }));

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

  const handleCancelProject = () => {
    setDialogOpen(false);
  };

  const handleSaveProject = () => {
    console.log(user, "Github");
    if (!user?.id) {
      toast.warning("Plaese login first");
      setLoading(false);
      return;
    }
    if (!projectName) {
      setLoading(false);
      toast.warning("Please enter project name");
      return;
    }
    gitClone(projectName)
      .then((res) => {
        createProjectInfo(res, {
          name: "YOU",
          ...user,
        }).then((res) => {
          getProjectList();
        });
        setLoading(false);
        setDialogOpen(false);
        toast.success("Import success from cloud");
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

  const gitClone = async (projectName) => {
    try {
      if (await existsPath(projectName)) {
        return new Promise((resolve, reject) => {
          reject(
            new Error("Project already exists, please enter project to sync")
          );
        });
      }
      let userName = user?.name;

      let url = window.origin + "/git/" + userName + "/" + projectName + ".git";
      console.log(projectName, "clonePath", url);

      return new Promise(async (resolve, reject) => {
        try {
          await cloneRepository(projectName, url, {
            singleBranch: false,
            token: githubApiToken,
            onProgress,
            onMessage,
          });
        } catch (err) {
          removeDirectory(projectName);
          reject(err);
        }
        resolve(projectName);
      });
    } catch (err) {
      toast.warning(err.message);
    }
  };

  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState([]);

  const getRepoList = async () => {
    if (!user?.id) {
      toast.warning("Please login first");
      return;
    }
    const res = await getGitRepoList();

    let data = res?.data;

    if (!data?.length) return [];

    let projectData = data.map((item) => {
      return {
        ...item,
        key: item.name,
        value: item.name,
        label: item.name,
      };
    });
    setOptions(projectData);
  };

  useEffect(() => {
    if (!dialogOpen) {
      setMessages("");
      setProgress(0);
      return;
    }
    getRepoList();
    getGiteaToekn(githubApiToken);
  }, [dialogOpen]);
  return (
    <ArDialog
      title="Import From Cloud"
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
          <ArSelect
            label="Cloud Repository Name"
            value={projectName}
            onChange={(event) => {
              setProjectName(event.target.value);
            }}
            options={options}
            fullWidth
            className="my-3"
          />
          {progress > 0 && (
            <GithubProgressBar progress={progress} messages={messages} />
          )}
        </div>
      </Box>
    </ArDialog>
  );
};

export default ImportGithub;
