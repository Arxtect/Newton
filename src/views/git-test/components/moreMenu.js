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
import ExportIcon from "@mui/icons-material/MoveToInbox"; // 假设您想要用这个图标作为导出的图标

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

      {/* Create Project Dialog */}
      <Dialog open={dialogOpen} onClose={handleCancelProject}>
        <DialogTitle>Create Project</DialogTitle>
        <DialogContent className="pt-[20px]">
          <Box
            component="form"
            sx={{
              "& .MuiTextField-root": { m: 1, width: "25ch" },
            }}
            noValidate
            autoComplete="off"
          >
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
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelProject} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSaveProject} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <PublishDocument
        open={openPublishDialog}
        pdfUrl={pdfUrl}
        handleClosePublish={handleClosePublish}
      />

      {/* Delete Project Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the project: {currentProject}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="primary">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MoreMenu;
