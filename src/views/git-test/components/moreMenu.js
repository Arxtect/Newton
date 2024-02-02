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
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { toast } from "react-toastify";

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
        <MenuItem onClick={handleCreateProject}>Create Project</MenuItem>
        <MenuItem onClick={handleDeleteProject}>Delete Project</MenuItem>
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
