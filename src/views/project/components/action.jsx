/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-07-30 15:02:25
 */
import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { IconButton } from "@mui/material";
import Tooltip from "@/components/tooltip";

import { useNavigate } from "react-router-dom";
import { downloadDirectoryAsZip, createProjectInfo } from "domain/filesystem";
import { toast } from "react-toastify";
import ArDialog from "@/components/arDialog";
import CopyProject from "../copyProject";
import RenameProject from "../renameProject";
import Share from "../share";
import { deleteGitRepo } from "services";
import { useUserStore, useLoginStore, useFileStore } from "@/store";
import ArIcon from "@/components/arIcon";
import { useAuthCallback } from "@/useHooks";

const HoverAction = forwardRef(
  ({ item, getProjectList, handleGithub }, ref) => {
    const authCallback = useAuthCallback();

    const { user } = useUserStore((state) => ({
      user: state.user,
    }));

    useImperativeHandle(ref, () => ({
      handleCopy,
      handleRename,
    }));

    const {
      projectLists,
      currentProjectRoot,
      deleteProject,
      changeCurrentProjectRoot,
      getCurrentProjectPdf,
      initFile,
      archivedDeleteProject,
    } = useFileStore((state) => ({
      allProject: state.allProject,
      currentProjectRoot: state.currentProjectRoot,
      deleteProject: state.deleteProject,
      changeCurrentProjectRoot: state.changeCurrentProjectRoot,
      getCurrentProjectPdf: state.getCurrentProjectPdf,
      initFile: state.initFile,
      archivedDeleteProject: state.archivedDeleteProject,
    }));

    //copy project
    const [sourceProject, setSourceProject] = useState("");
    const [copyDialogOpen, setCopyDialogOpen] = useState(false);
    const handleCopy = (title) => {
      setSourceProject(title);
      setCopyDialogOpen(true);
    };

    //rename project
    const [renameSourceProject, setRenameSourceProject] = useState("");
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const handleRename = (title) => {
      setRenameSourceProject(title);
      setRenameDialogOpen(true);
    };

    const handleDeleteGitRepo = async () => {
      let res = await deleteGitRepo(deleteProjectName);
      if (res?.status == "success") {
        getProjectList();
        setDeleteDialogOpen(false);
        toast.success("Delete success");
      }
    };

    const restoreProject = async (rootName) => {
      await createProjectInfo(rootName, {
        isClosed: false,
      });

      getProjectList();
    };

    // share project
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareProjectName, setShareProjectName] = useState("");

    const controlShare = (project) => {
      authCallback(() => {
        setShareProjectName(project);
        setShareDialogOpen(true);
      }, "Please login first");
    };

    // download pdf
    const downloadPdf = async (projectName) => {
      const blobUrl = await getCurrentProjectPdf(projectName);
      console.log(blobUrl, "blobUrl");

      if (!blobUrl) {
        toast.warning("project is not compiled please compile it first");
        return;
      }
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = projectName + ".pdf";
      link.click();
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 30000);
    };

    // delete project
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteProjectName, setDeleteProjectName] = useState("");
    const [isGitDelete, setIsGitDelete] = useState(false);
    const [isTrashDelete, setIsTrashDelete] = useState(false);

    const handleDeleteProject = (deleteProjectName) => {
      if (!deleteProjectName) {
        toast.error("Please select a project to delete");
        return;
      }
      setDeleteDialogOpen(true);
      setDeleteProjectName(deleteProjectName);
    };

    const handleConfirmDelete = async () => {
      await archivedDeleteProject({ dirpath: deleteProjectName });
      toast.success("trash project success");
      getProjectList();
      setDeleteDialogOpen(false);
    };
    const handlTrashDelete = async () => {
      await deleteProject({ dirpath: deleteProjectName });
      toast.success("delete project success");
      getProjectList();
      setDeleteDialogOpen(false);
    };

    const handleCancelDelete = () => {
      setDeleteDialogOpen(false);
    };

    return (
      <div className="flex items-center w-full justify-center">
        {item?.type == "git" ? (
          <React.Fragment>
            <Tooltip content="Import" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGithub(true, item.title);
                }}
              >
                <ArIcon name={"GitCloud"} className="text-black w-4 h-4" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Delete" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(item.title);
                  setIsGitDelete(true);
                  setIsTrashDelete(false);
                }}
              >
                <ArIcon name={"Delete"} className="text-black w-4 h-4" />
              </IconButton>
            </Tooltip>
          </React.Fragment>
        ) : item?.isClosed ? (
          <React.Fragment>
            <Tooltip content="Restore" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  restoreProject(item.title);
                }}
              >
                <ArIcon name={"Restore"} className="text-black w-4 h-4" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Delete" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(item.title);
                  setIsTrashDelete(true);
                  setIsGitDelete(false);
                }}
              >
                <ArIcon name={"Delete"} className="text-black  w-4 h-4" />
              </IconButton>
            </Tooltip>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Tooltip content="Download" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();

                  authCallback(() => {
                    downloadDirectoryAsZip(item.title);
                  });
                }}
              >
                <ArIcon
                  name={"DownloadProject"}
                  className="text-black w-4 h-4"
                />
              </IconButton>
            </Tooltip>
            <Tooltip content="Copy" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  authCallback(() => {
                    handleCopy(item.title);
                  });
                }}
              >
                <ArIcon name={"Copy"} className="text-black" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Download PDF" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();

                  authCallback(() => {
                    downloadPdf(item.title);
                  });
                }}
              >
                <ArIcon name={"DownloadPdf"} className="text-black" />
              </IconButton>
            </Tooltip>
            <Tooltip content="SHARE" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.userId && item.userId != user.id) {
                    toast.warning(
                      "this project is shared, You didn't have permission to share"
                    );
                    return;
                  }

                  authCallback(() => {
                    controlShare(item.title);
                  });
                }}
              >
                <ArIcon name={"Share"} className="text-black w-4 h-4" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Trash" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGitDelete(false);
                  setIsTrashDelete(false);
                  authCallback(() => {
                    handleDeleteProject(item.title);
                  });
                }}
              >
                <ArIcon name={"Delete"} className="text-black" />
              </IconButton>
            </Tooltip>
          </React.Fragment>
        )}

        <CopyProject
          dialogOpen={copyDialogOpen}
          setDialogOpen={setCopyDialogOpen}
          sourceProject={sourceProject}
          setSourceProject={setSourceProject}
          getProjectList={getProjectList}
        />
        <RenameProject
          dialogOpen={renameDialogOpen}
          setDialogOpen={setRenameDialogOpen}
          sourceProject={renameSourceProject}
          setSourceProject={setRenameSourceProject}
          getProjectList={getProjectList}
        />
        <Share
          dialogOpen={shareDialogOpen}
          setDialogOpen={setShareDialogOpen}
          rootPath={shareProjectName}
          user={user}
          getProjectList={getProjectList}
        ></Share>
        <ArDialog
          title={
            isTrashDelete || isGitDelete ? "Delete Project" : "Trash Project"
          }
          dialogOpen={deleteDialogOpen}
          handleCancel={handleCancelDelete}
          buttonList={[
            { title: "Cancel", click: handleCancelDelete },
            {
              title: "Delete",
              click: isGitDelete
                ? handleDeleteGitRepo
                : isTrashDelete
                ? handlTrashDelete
                : handleConfirmDelete,
            },
          ]}
        >
          {`Are you sure you want to ${
            isTrashDelete || isGitDelete ? "delete" : "trash"
          } the project：`}
          <span className="text-red-500 mr-1">{deleteProjectName}</span>
        </ArDialog>
      </div>
    );
  }
);

export default HoverAction;
