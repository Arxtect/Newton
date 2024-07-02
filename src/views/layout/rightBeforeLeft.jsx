import React, { useState, useRef } from "react";
import { IconButton, Tooltip, Menu, TextField, Box } from "@mui/material";
import { updateDialogLoginOpen } from "store";

import { toast } from "react-toastify";
import { downloadDirectoryAsZip } from "domain/filesystem";
import PublishDocument from "./publishDocument";
import PublishIcon from "@mui/icons-material/Publish";
import CreateIcon from "@mui/icons-material/AddBoxRounded";
import DeleteIcon from "@mui/icons-material/Delete";
import ExportIcon from "@mui/icons-material/MoveToInbox";
import ArDialog from "@/components/arDialog";
import { FileUploader, FolderUploader } from "./upload.jsx";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";

import { usePdfPreviewStore, useUserStore } from "store";
import { useNavigate } from "react-router-dom";

const RightBeforeLeft = ({
  reload,
  filepath,
  currentSelectDir,
  createProject,
  deleteProject,
  currentProject,
  projectLists,
  projectSync,
  ...props
}) => {
  const navigate = useNavigate();
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
  const fileUploaderRef = useRef(null);
  const folderUploaderRef = useRef(null);

  const actionList = [
    {
      id: "Publish Project",
      title: "Publish Project",
      icon: <PublishIcon />,
      onClick: handleOpenPublish,
    },
    {
      id: "Create Project",
      title: "Create Project",
      icon: <CreateIcon />,
      onClick: handleCreateProject,
    },
    {
      id: "Delete Project",
      title: "Delete Project",
      icon: <DeleteIcon />,
      onClick: handleDeleteProject,
    },
    {
      id: "Export Project",
      title: "Export Project",
      icon: <ExportIcon />,
      onClick: handleExportProject,
    },
  ];
  return (
    <>
      <Tooltip title={"Home"} id="Home">
        <IconButton
          color="#inherit"
          aria-label="Home"
          size="small"
          onClick={() => {
            navigate("/project");
          }}
        >
          <HomeRoundedIcon
            className="text-[#000]"
            fontSize="small"
          ></HomeRoundedIcon>
        </IconButton>
      </Tooltip>
      <FileUploader
        onClick={() => fileUploaderRef.current.click()}
        reload={reload}
        filepath={filepath}
        currentSelectDir={currentSelectDir}
        currentProject={currentProject}
        fontSize="small"
        ref={fileUploaderRef}
        title={"Upload File"}
        projectSync={projectSync}
      ></FileUploader>
      <FolderUploader
        onClick={() => folderUploaderRef.current.click()}
        reload={reload}
        filepath={filepath}
        currentSelectDir={currentSelectDir}
        fontSize="small"
        ref={folderUploaderRef}
        currentProject={currentProject}
        projectSync={projectSync}
        title="Upload Folder"
      ></FolderUploader>
      {actionList.map((item) => {
        return (
          <Tooltip title={item.title} id={item.id}>
            <IconButton
              color="#inherit"
              aria-label="controls"
              size="small"
              onClick={() => {
                item.onClick && item.onClick();
              }}
            >
              {React.cloneElement(item.icon, {
                className: "text-[#000]",
                fontSize: "small",
              })}
            </IconButton>
          </Tooltip>
        );
      })}
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

export default RightBeforeLeft;
