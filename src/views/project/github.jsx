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
import path from "path";
import { cloneRepository } from "domain/git";
import { createProjectInfo } from "domain/filesystem";
import {getGitToken} from "@/services"

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
  const [projectName, setProjectName] = useState("");
  const [messages, setMessages] = useState("");
  const [progress, setProgress] = useState(0);
  const {
    githubApiToken,
    changeConfig,
  } = useGitRepo((state) => ({
    githubApiToken: state.githubApiToken,
    changeConfig: state.changeConfig,
  }));

  const [gitConfig, setGitConfig] = useState({
    githubApiToken: githubApiToken,
  });

  const getGiteaToekn=async (token) =>{
   try{
    let res= await getGitToken(token)
    console.log(res.data,'123123123')
    changeConfig({
      githubApiToken:res?.data
    })
     return res.data
   }catch(err){
     changeConfig({githubApiToken:""})
   }
  }

  useEffect(()=>{
    if(!dialogOpen) return
    getGiteaToekn(githubApiToken)
  },[dialogOpen])

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
      gitConfig.githubApiToken
    ) {
      changeConfig({
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
        const user = useUserStore.getState().user;
        console.log(user, res, "user");
        createProjectInfo(res, {
          name: "YOU",
          ...user,
        }).then((res) => {
          getProjectList();
        });
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

    return new Promise(async (resolve, reject) => {
      await cloneRepository(destPath, clonePath, {
        singleBranch: false,
        token: gitConfig.githubApiToken,
        onProgress,
        onMessage,
      });
      resolve(destPath);
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
        {/* {!githubApiToken && (
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
        )} */}
      </Box>
    </ArDialog>
  );
};

export default ImportGithub;
