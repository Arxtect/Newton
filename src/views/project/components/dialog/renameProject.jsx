/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ArDialog from "@/components/arDialog";
import { TextField, Box } from "@mui/material";
import { useFileStore } from "store";
import { toast } from "react-toastify";
import pify from "pify";
import path from "path";
import fs from "fs";
import { getProjectInfo, createProjectInfo } from "domain/filesystem";

const RenameProject = ({
  dialogOpen,
  setDialogOpen,
  setSourceProject,
  getProjectList,
  sourceProject = "",
  parentDir = ".",
}) => {
  const [projectName, setProjectName] = useState("");

  const { fileMoved } = useFileStore((state) => ({
    fileMoved: state.fileMoved,
  }));

  useEffect(() => {
    if (sourceProject !== "" && projectName !== sourceProject) {
      setProjectName(sourceProject);
    }
  }, [sourceProject]);

  const handleCancelProject = () => {
    setDialogOpen(false);
  };

  const handleSaveProject = async () => {
    if (!projectName) {
      toast.warning("Please enter project name");
      return;
    }
    const newSourceProject = path.join(parentDir, sourceProject);
    const newProjectName = path.dirname(newSourceProject);

    const newDirPath = path.join(newProjectName, projectName);
    try {
      // Rename the directory
      await pify(fs.rename)(newSourceProject, newDirPath);
      await fileMoved({ fromPath: newSourceProject, destPath: newDirPath });
      setDialogOpen(false);
      setSourceProject("");
      toast.success("Project renamed successfully");

      // await createProjectInfo(newDirPath, {});
      getProjectList();
    } catch (error) {
      console.error("Error renaming directory:", error);
    }
  };

  return (
    <ArDialog
      title="Rename Project"
      dialogOpen={dialogOpen}
      handleCancel={handleCancelProject}
      buttonList={[
        { title: "Cancel", click: handleCancelProject },
        { title: "Save", click: handleSaveProject },
      ]}
      width={"50vw"}
    >
      <Box component="form" noValidate autoComplete="off" className="my-4">
        <TextField
          label="Project Name"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          size="small"
          htmlFor="component-outlined"
          id="outlined-size-small"
          inputProps={{
            style: { height: "40px" },
          }}
          className="w-full"
        />
      </Box>
    </ArDialog>
  );
};

export default RenameProject;
