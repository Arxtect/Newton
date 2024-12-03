import React, { useMemo, useRef, useState, useEffect } from "react";
import { IconButton } from "@mui/material";
import Tooltip from "@/components/tooltip";

import { useNavigate } from "react-router-dom";
import {
  downloadDirectoryAsZip,
  createProjectInfo,
  findAllProjectInfo,
  getProjectInfo,
} from "domain/filesystem";
import { toast } from "react-toastify";
import ArDialog from "@/components/arDialog";

import { useFileStore } from "@/store";
import ArIcon from "@/components/arIcon";
import { useAuthCallback } from "@/useHooks";

import {
  getYDocToken,
  deleteGitRepo,
  getGitRepoList,
  getRoomUserAccess,
} from "services";
import { ProjectSync } from "@/convergence";

import CopyProject from "../dialog/copyProject";
import RenameProject from "../dialog/renameProject";
import Share from "../dialog/share";
import Github from "../dialog/github";

import ContentBar from "./top/contentBar";
import Grid from "./list/grid";
import Table from "./list/table";

const Content = React.forwardRef(
  ({ currentSelectMenu, setCurrentSelectMenu, user }, ref) => {
    const navigate = useNavigate();

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

    // share project
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareProjectName, setShareProjectName] = useState("");

    const controlShare = (project) => {
      authCallback(() => {
        setShareProjectName(project);
        setShareDialogOpen(true);
      }, "Please login first");
    };

    // delete project
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteProjectName, setDeleteProjectName] = useState("");
    const [isGitDelete, setIsGitDelete] = useState(false);
    const [isTrashDelete, setIsTrashDelete] = useState(false);

    const handleCancelDelete = () => {
      setDeleteDialogOpen(false);
    };

    const handleDeleteGitRepo = async () => {
      let res = await deleteGitRepo(deleteProjectName);
      if (res?.status == "success") {
        getProjectList();
        setDeleteDialogOpen(false);
        toast.success("Delete success");
      }
    };
    const handleConfirmDelete = async () => {
      await archivedDeleteProject({ dirpath: deleteProjectName });
      toast.success("trash project success");
      getProjectList();
      setDeleteDialogOpen(false);
    };

    const handleTrashDelete = async () => {
      await deleteProject({ dirpath: deleteProjectName });
      toast.success("delete project success");
      getProjectList();
      setDeleteDialogOpen(false);
    };

    const handleDeleteProject = (deleteProjectName) => {
      if (!deleteProjectName) {
        toast.error("Please select a project to delete");
        return;
      }
      setDeleteDialogOpen(true);
      setDeleteProjectName(deleteProjectName);
    };

    // search
    const [searchInput, setSearchInput] = useState("");
    const [selectedRows, setSelectedRows] = React.useState([]);

    //project list
    const [projectData, setProjectData] = useState([]);

    const getRepoList = async () => {
      try {
        const res = await getGitRepoList();

        let data = res?.data;

        if (!data?.length) return [];

        let projectData = data.map((item) => {
          const { name, updated_at, ...res } = item;
          return {
            ...res,
            title: name,
            lastModified: updated_at,
            name: item.owner?.login,
            type: "git",
          };
        });

        console.log(projectData, "1111");
        return projectData;
      } catch (err) {
        toast.warning(err);
      }
    };

    //get project list
    const getProjectList = async () => {
      console.log(currentSelectMenu, "currentSelectMenu");
      let project = [];

      if (currentSelectMenu == "git") {
        project = await getRepoList();
      } else {
        project = await findAllProjectInfo();
      }
      if (!project) return;

      console.log(project, "project");
      const projectData = project
        .map((item, index) => {
          return handleSwitchMenu(currentSelectMenu, user, item, index);
        })
        .filter((item) => item?.title);
      setProjectData(projectData);
    };

    const handleSwitchMenu = (menu, user, item, index) => {
      if (!user?.email && item.name != "YOU") {
        return null;
      }
      switch (menu) {
        case "trash":
          if (item.isClosed) {
            return {
              id: index + 1,
              ...item,
            };
          }
          break;
        case "category":
          return null;
        case "shared":
          if (item?.email != user?.email && item?.isSync && !item.isClosed) {
            return {
              id: index + 1,
              ...item,
            };
          }
          break;
        case "your":
          if (
            !item.isClosed &&
            (item?.email == user?.email || item.name == "YOU")
          ) {
            return {
              id: index + 1,
              ...item,
            };
          }
          break;
        case "all":
          if (
            user?.email &&
            !item.isClosed &&
            (item?.email == user?.email || item?.isSync)
          ) {
            return {
              id: index + 1,
              ...item,
            };
          } else if (item.name == "YOU" && !item.isClosed) {
            return {
              id: index + 1,
              ...item,
            };
          }
          break;
        case "git":
          return {
            id: index + 1,
            ...item,
          };
        default:
          break;
      }
    };
    const authCallback = useAuthCallback();
    const auth = (condition, callback) => {
      if (condition) {
        authCallback(callback, "Please login first");
        return true;
      }
      return false;
    };

    //table top
    const [sortType, setSortType] = useState("table");
    const [sortSelect, setSortSelect] = useState("lastModified");

    useEffect(() => {
      if (sortType === "table") return;
      setSelectedRows([]);
    }, [sortType]);

    //table list
    const sortedRows = useMemo(() => {
      return [...projectData]
        .filter((data) => data.title.includes(searchInput))
        .sort((a, b) => {
          if (sortSelect === "lastModified") {
            return b.lastModified - a.lastModified;
          } else if (sortSelect === "lastCreated") {
            return b.created_at - a.created_at;
          } else if (sortSelect === "alphabetical") {
            return a.title.localeCompare(b.title);
          }
          return 0;
        });
    }, [projectData, searchInput, sortSelect]);

    //github
    const [githubDialogOpen, setGithubDialogOpen] = useState(false);
    const [projectName, setProjectName] = useState("");

    const handleGithub = (open, proejctName) => {
      setGithubDialogOpen(open);
      setProjectName(proejctName);
    };

    // sync project
    const [projectSync, setProjectSync] = useState(null);

    const [syncDialogOpen, setSyncDialogOpen] = useState(false);

    const [syncParams, setSyncParams] = useState({});

    const handleSyncProject = (syncProjectName, roomId) => {
      setSyncParams({ roomId, project: syncProjectName });
      setSyncDialogOpen(true);
    };
    const getYDocTokenReq = async (room) => {
      const res = await getYDocToken(room);
      return res;
    };
    const handleConfirmSync = async () => {
      const {token,position} = await getYDocTokenReq(syncParams.project+syncParams.roomId);
      const projectSync = new ProjectSync(
        syncParams.project,
        user,
        syncParams.roomId,
        token,
        position,
        getProjectList
      );
      await projectSync.setObserveHandler();

      setProjectSync(projectSync);
      setSyncDialogOpen(false);
    };
    const handleCancelSync = () => {
      setSyncDialogOpen(false);
    };

    const initShareProject = async () => {
      const hash = window.location.hash;
      const queryString = hash.includes("?") ? hash.split("?")[1] : "";
      const searchParams = new URLSearchParams(queryString);

      const project = searchParams.get("project");
      const roomId = searchParams.get("roomId");

      if (!project || !roomId) return;

      if (!user || JSON.stringify(user) === "{}") {
        authCallback(() => handleSyncProject(project, roomId));
        return;
      }

      const res = await getRoomUserAccess({
        project_name: project + roomId,
      });
      if (res?.status != "success") {
        toast.error("Get room user access failed.");
        return;
      }

      if (res?.access == "r") {
        toast.info(
          "The project is read-only for you, please contact your project manager to modify it."
        );
      }

      if (res?.access == "no") {
        toast.info(
          "The project is not shared for you, please contact your project manager to modify it."
        );
        navigate("/project");
        return;
      }

      handleSyncProject(project, roomId);
    };

    useEffect(() => {
      const init = async () => {
        await initShareProject(getProjectList);
      };

      init();
      getProjectList();
      return () => {
        if (projectSync) {
          projectSync?.leaveCollaboration && projectSync?.leaveCollaboration();
        }
      };
    }, []);

    useEffect(() => {
      getProjectList();
    }, [currentSelectMenu, user]);

    React.useImperativeHandle(ref, () => ({
      getProjectList,
    }));

    return (
      <>
        <div className="flex flex-col w-full">
          <ContentBar
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            selectedRows={selectedRows}
            auth={auth}
            user={user}
            getProjectList={getProjectList}
            handleCopy={handleCopy}
            handleRename={handleRename}
          ></ContentBar>
          <div className="flex justify-between gap-5 mt-5 w-full max-md:flex-wrap">
            <div className="flex justify-between items-center text-xl font-semibold  text-center text-black">
              Projects Dashboard
              {currentSelectMenu == "trash" && (
                <Tooltip
                  content="Trash project are automatically deleted after 30 days"
                  position={"top"}
                >
                  <ArIcon
                    name={"Tip"}
                    className="w-[0.9rem] h-[0.9rem] ml-2 cursor-pointer text-arxTheme"
                  />
                </Tooltip>
              )}
            </div>
            <div className="flex gap-3.5">
              <div className="grow my-auto text-base font-medium text-center text-black">
                Sort By
              </div>
              <div className="flex rounded bg-gray-200 overflow-hidden">
                <Tooltip content="Table" position={"bottom"}>
                  <div
                    className={`flex items-center justify-center w-7 h-7 cursor-pointer ${
                      sortType === "table" ? "bg-arxTheme" : ""
                    }`}
                    onClick={() => setSortType("table")}
                  >
                    <ArIcon name={"Table"} className="w-5 h-5" />
                  </div>
                </Tooltip>
                <Tooltip content="Grid" position={"bottom"}>
                  <div
                    className={`flex items-center justify-center w-7 h-7 cursor-pointer ${
                      sortType === "grid" ? "bg-arxTheme" : "bg-gray-200"
                    } ${
                      currentSelectMenu !== "git" &&
                      currentSelectMenu !== "trash"
                        ? ""
                        : "opacity-50 cursor-not-allowed"
                    }`}
                    onClick={
                      currentSelectMenu !== "git" &&
                      currentSelectMenu !== "trash"
                        ? () => setSortType("grid")
                        : null
                    }
                  >
                    <ArIcon name={"Grid"} className="w-5 h-5" />
                  </div>
                </Tooltip>
              </div>
              <div className="relative inline-block text-gray-700">
                <select
                  value={sortSelect}
                  onChange={(event) => setSortSelect(event.target.value)}
                  className="appearance-none bg-gray-200 border border-gray-300 text-gray-700 pl-1 pr-5 rounded focus:outline-none py-[0.05rem]"
                >
                  <option value="lastModified">Last modified</option>
                  <option value="lastCreated">Last created</option>
                  <option value="alphabetical">Alphabetical</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ArIcon name={"Expand"} />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-5 ">
            {sortType == "table" ? (
              <Table
                sortSelect={sortSelect}
                searchInput={searchInput}
                setSelectedRows={setSelectedRows}
                projectData={projectData}
                getProjectList={getProjectList}
                sortedRows={sortedRows}
                currentSelectMenu={currentSelectMenu}
                auth={auth}
                user={user}
                handleGithub={handleGithub}
                handleCopy={handleCopy}
                handleRename={handleRename}
                controlShare={controlShare}
                handleDeleteProject={handleDeleteProject}
                setIsGitDelete={setIsGitDelete}
                setIsTrashDelete={setIsTrashDelete}
              ></Table>
            ) : (
              <Grid
                sortSelect={sortSelect}
                searchInput={searchInput}
                setSelectedRows={setSelectedRows}
                projectData={projectData}
                getProjectList={getProjectList}
                sortedRows={sortedRows}
                auth={auth}
                user={user}
                setGithubDialogOpen={setGithubDialogOpen}
                changeCurrentProjectRoot={changeCurrentProjectRoot}
                handleGithub={handleGithub}
                handleCopy={handleCopy}
                handleRename={handleRename}
                controlShare={controlShare}
                handleDeleteProject={handleDeleteProject}
                setIsGitDelete={setIsGitDelete}
                setIsTrashDelete={setIsTrashDelete}
              ></Grid>
            )}
          </div>
        </div>

        <>
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
          <Github
            dialogOpen={githubDialogOpen}
            setDialogOpen={setGithubDialogOpen}
            getProjectList={getProjectList}
            user={user}
            projectName={projectName}
            setProjectName={setProjectName}
            currentSelectMenu={currentSelectMenu}
          ></Github>
          <ArDialog
            title="Sync Project"
            dialogOpen={syncDialogOpen}
            handleCancel={handleCancelSync}
            buttonList={[
              { title: "Cancel", click: handleCancelSync },
              { title: "Confirm", click: handleConfirmSync },
            ]}
          >
            Whether to enter the collaboration project:
            <span className="text-red-500 mr-1">{syncParams.project}</span>
          </ArDialog>
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
                  ? handleTrashDelete
                  : handleConfirmDelete,
              },
            ]}
          >
            {`Are you sure you want to ${
              isTrashDelete || isGitDelete ? "delete" : "trash"
            } the project：`}
            <span className="text-red-500 mr-1">{deleteProjectName}</span>
          </ArDialog>
        </>
      </>
    );
  }
);

export default React.memo(Content);
