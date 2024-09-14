/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-06 21:26:51
 */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ArDialog from "@/components/arDialog";
import { TextField, Box } from "@mui/material";
import { useFileStore } from "store";
import { toast } from "react-toastify";

const CopyProject = ({
  dialogOpen,
  setDialogOpen,
  setSourceProject,
  getProjectList,
  sourceProject = "",
}) => {
  const [projectName, setProjectName] = useState("");

  const { copyProject } = useFileStore((state) => ({
    copyProject: state.copyProject,
  }));

  useEffect(() => {
    setProjectName(sourceProject !== "" ? sourceProject + "(Copy)" : "");
  }, [sourceProject]);

  const handleCancelProject = () => {
    setDialogOpen(false);
  };
  const handleSaveProject = () => {
    if (!projectName) {
      toast.warning("Please enter project name");
      return;
    }
    copyProject(sourceProject, projectName)
      .then(() => {
        getProjectList();
        setDialogOpen(false);
        setSourceProject("")
      })
      .catch((error) => {
        toast.warning(error.message);
      });
  };
  return (
    <ArDialog
      title="Copy Project"
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

export default CopyProject;
