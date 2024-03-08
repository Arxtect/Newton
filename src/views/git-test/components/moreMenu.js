import React, { useState } from "react";
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Box,
} from "@mui/material";
import { getCookie } from "@/util";
import { updateDialogLoginOpen } from "store";

import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { toast } from "react-toastify";
import { downloadDirectoryAsZip } from "domain/filesystem";
import PublishDocument from "./publishDocument";
import ListItemIcon from "@mui/material/ListItemIcon";
import PublishIcon from "@mui/icons-material/Publish";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import ExportIcon from "@mui/icons-material/MoveToInbox";
import ArDialog from "@/components/arDialog";

import { usePdfPreviewStore, useUserStore } from "store";
const MoreMenu = ({
  reload,
  filepath,
  currentSelectDir,
  createProject,
  deleteProject,
  currentProject,
  projectLists,
  ...props
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

  const { pdfUrl } = usePdfPreviewStore((state) => ({
    pdfUrl: state.pdfUrl,
  }));
  const { accessToken, updateAccessToken } = useUserStore();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCreateProject = () => {
    setDialogOpen(true);
    handleClose();
  };

  const handleDeleteProject = () => {
    if (projectLists.length <= 1) {
      toast.warning("Can't delete all projects，already only one");
      handleClose();
      return;
    }
    setDeleteDialogOpen(true);
    handleClose();
  };

  const handleConfirmDelete = () => {
    deleteProject({ dirpath: currentProject });
    setDeleteDialogOpen(false);
  };

  const handleSaveProject = () => {
    createProject(projectName);
    setDialogOpen(false);
  };

  const handleCancelProject = () => {
    setDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const handleExportProject = () => {
    downloadDirectoryAsZip(currentProject);
    handleClose();
  };

  const [openPublishDialog, setOpenPublishDialog] = useState(false);

  const handleOpenPublish = () => {
    console.log(accessToken, "cookie");
    if (!accessToken || accessToken == "") {
      updateDialogLoginOpen(true);
      toast.warning("Please login");
      return;
    }
    // if (!pdfUrl) {
    //   toast.warning("Please compile first");
    //   return;
    // }
    setOpenPublishDialog(true);
    handleClose();
  };

  const handleClosePublish = () => {
    setOpenPublishDialog(false);
  };

  return (
    <>
      <Tooltip title="more">
        <IconButton className="text-gray-700" onClick={handleClick}>
          <MoreHorizIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        style={{ left: "0px", top: "0px" }}
      >
        <MenuItem onClick={handleOpenPublish}>
          <ListItemIcon>
            <PublishIcon fontSize="small" />
          </ListItemIcon>
          Publish Project
        </MenuItem>
        <MenuItem onClick={handleCreateProject}>
          <ListItemIcon>
            <CreateIcon fontSize="small" />
          </ListItemIcon>
          Create Project
        </MenuItem>
        <MenuItem onClick={handleDeleteProject}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          Delete Project
        </MenuItem>
        <MenuItem onClick={handleExportProject}>
          <ListItemIcon>
            <ExportIcon fontSize="small" />
          </ListItemIcon>
          Export Project
        </MenuItem>
      </Menu>
      <ArDialog
        title="Create Project"
        dialogOpen={dialogOpen}
        handleCancel={handleCancelProject}
        buttonList={[
          { title: "Cancel", click: handleCancelProject },
          { title: "Save", click: handleSaveProject },
        ]}
      >
        <Box component="form" noValidate autoComplete="off" className="my-4">
          <TextField
            w-full
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
      <PublishDocument
        open={openPublishDialog}
        pdfUrl={pdfUrl}
        handleClosePublish={handleClosePublish}
      />
      {/* Delete Project Confirmation Dialog */}
      <ArDialog
        title="Delete Project"
        dialogOpen={deleteDialogOpen}
        handleCancel={handleCancelDelete}
        buttonList={[
          { title: "Cancel", click: handleCancelDelete },
          { title: "Delete", click: handleConfirmDelete },
        ]}
      >
        Are you sure you want to delete the project：
        <span className="text-red-500 mr-1">{currentProject}</span>
      </ArDialog>
    </>
  );
};

export default MoreMenu;
