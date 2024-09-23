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
import copySvg from "@/assets/project/copy.svg";
import deleteSvg from "@/assets/project/delete.svg";
import downloadSvg from "@/assets/project/download.svg";
import gitCloudSvg from "@/assets/project/gitCloud.svg";
import restoreSvg from "@/assets/project/restore.svg";
import renameSvg from "@/assets/project/rename.svg";
import shareSvg from "@/assets/project/share.svg";
import downloadPdfSvg from "@/assets/project/downloadPdf.svg";
import { toast } from "react-toastify";
import ArDialog from "@/components/arDialog";
import CopyProject from "../copyProject";
import RenameProject from "../renameProject";
import Share from "../share";
import { deleteGitRepo } from "services";
import { useUserStore, useLoginStore, useFileStore } from "@/store";

const HoverAction = forwardRef(
  ({ item, auth, getProjectList, handleGithub }, ref) => {
    const navigate = useNavigate();
    const { user, accessToken } = useUserStore((state) => ({
      user: state.user,
      accessToken: state.accessToken,
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

    const { updateDialogLoginOpen, updateOtherOperation } = useLoginStore(
      (state) => ({
        updateDialogLoginOpen: state.updateDialogLoginOpen,
        updateOtherOperation: state.updateOtherOperation,
      })
    );
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
      console.log(user, accessToken, "user");
      if (!user || JSON.stringify(user) === "{}") {
        toast.warning("Please login");
        updateDialogLoginOpen(true);
        return;
      }
      setShareProjectName(project);
      setShareDialogOpen(true);
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
      <div className="flex items-center">
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
                <img src={gitCloudSvg} className="w-4" alt="" />
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
                <img src={deleteSvg} alt="" />
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
                <img src={restoreSvg} className="w-4" alt="" />
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
                <img src={deleteSvg} alt="" />
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
                  const isAuth = auth(
                    item.name != "YOU" &&
                      (!user || JSON.stringify(user) === "{}"),
                    () => {
                      downloadDirectoryAsZip(item.title);
                    }
                  );
                  if (isAuth) return;
                  downloadDirectoryAsZip(item.title);
                }}
              >
                <img src={downloadSvg} alt="" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Copy" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const isAuth = auth(
                    item.name != "YOU" &&
                      (!user || JSON.stringify(user) === "{}"),
                    () => {
                      handleCopy(item.title);
                    }
                  );
                  if (isAuth) return;
                  handleCopy(item.title);
                }}
              >
                <img src={copySvg} alt="" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Download PDF" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  const isAuth = auth(
                    item.name != "YOU" &&
                      (!user || JSON.stringify(user) === "{}"),
                    () => {
                      downloadPdf(item.title);
                    }
                  );
                  if (isAuth) return;
                  downloadPdf(item.title);
                }}
              >
                <img src={downloadPdfSvg} alt="" />
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
                  const isAuth = auth(
                    item.name != "YOU" &&
                      (!user || JSON.stringify(user) === "{}"),
                    () => {
                      controlShare(item.title);
                    }
                  );
                  if (isAuth) return;
                  controlShare(item.title);
                }}
              >
                <img src={shareSvg} alt="" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Trash" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGitDelete(false);
                  setIsTrashDelete(false);
                  const isAuth = auth(
                    item.name != "YOU" &&
                      (!user || JSON.stringify(user) === "{}"),
                    () => {
                      handleDeleteProject(item.title);
                    }
                  );
                  if (isAuth) return;
                  handleDeleteProject(item.title);
                }}
              >
                <img src={deleteSvg} alt="" />
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
