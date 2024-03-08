/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-06 21:26:51
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ArDialog from "@/components/arDialog";
import { Card, CardContent, Typography, TextField, Box } from "@mui/material";
import { useFileStore, useGitRepo } from "store";
import { toast } from "react-toastify";
import ArTextField from "@/components/arTextField";
import path from "path";
import { cloneRepository } from "domain/git";

const ImportGithub = ({ dialogOpen, setDialogOpen, getProjectList }) => {
  const [projectName, setProjectName] = useState("");

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

  const handleCancelProject = () => {
    setDialogOpen(false);
  };
  const handleSaveProject = () => {
    if (!projectName) {
      toast.warning("Please enter project name");
      return;
    }
    gitClone(projectName)
      .then((res) => {
        console.log(res);
        getProjectList();
        setDialogOpen(false);
        toast.success("Import success from github");
      })
      .catch((error) => {
        toast.warning(error.message);
      });
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
      token: githubApiToken,
    });
  };

  return (
    <ArDialog
      title="Import From Github"
      dialogOpen={dialogOpen}
      handleCancel={handleCancelProject}
      buttonList={[
        { title: "Cancel", click: handleCancelProject },
        { title: "Save", click: handleSaveProject },
      ]}
      width={"40vw"}
    >
      <Box component="form" noValidate autoComplete="off">
        <div className="w-[100%]">
          <ArTextField
            label="Github Repository Url"
            placeholder="please input github repository url"
            defaultValue={""}
            onChange={(event) => {
              setProjectName(event.target.value);
            }}
            margin="normal"
            fullWidth
            className="my-3"
          />
        </div>
        {!committerName && (
          <div className="w-[100%]">
            <ArTextField
              label="Git: Committer Name"
              placeholder="Your committer name"
              defaultValue={committerName}
              onChange={(event) => {
                changeConfig({ committerName: event.target.value });
              }}
              sx={{ width: "100%" }}
              className="my-3"
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
                changeConfig({ committerEmail: event.target.value })
              }
              sx={{ width: "100%" }}
              className="my-3"
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
                changeConfig({ githubApiToken: event.target.value })
              }
              className="my-3"
              sx={{ width: "100%" }}
            />
          </div>
        )}
      </Box>
    </ArDialog>
  );
};

export default ImportGithub;
