/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import React, { useRef, useEffect, useState, useCallback } from "react";
import Slide from "./components/slide/index";
import Content from "./components/content/index";
import { useUserStore, useFileStore } from "@/store";
import CopyProject from "./components/dialog/copyProject";
import RenameProject from "./components/dialog/renameProject";
import Share from "./components/dialog/share";
import Github from "./components/dialog/github";
import {
  getYDocToken,
  deleteGitRepo,
  getGitRepoList,
  getRoomUserAccess,
  getProjectViaOwner,
  deleteProject as deleteProjectService,
} from "services";
import { ProjectSync, ProjectSyncDownload } from "@/convergence";
import { useNavigate } from "react-router-dom";
import {
  downloadDirectoryAsZip,
  createProjectInfo,
  findAllProjectInfo,
  getProjectInfo,
  getShareProjectInfo,
  getShareUserStoragePath,
  existsPath,
} from "domain/filesystem";
import ArDialog from "@/components/arDialog";
import { toast } from "react-toastify";
import { useAuthCallback } from "@/useHooks";
import { waitForCondition } from "@/utils";
import { ArLoadingOverlay } from "@/components/arLoading";
import path from "path";
import * as Y from "yjs";
import * as FS from "domain/filesystem";
import { rm } from "fs";

const Project = () => {
  const { user } = useUserStore((state) => ({
    user: state.user,
  }));
  const navigate = useNavigate();

  const authCallback = useAuthCallback();
  const auth = (condition, callback) => {
    if (condition) {
      authCallback(callback, "Please login first");
      return true;
    }
    return false;
  };

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
        if (
          item?.email != user?.email &&
          item?.parentDir !== "." &&
          !item.isClosed
        ) {
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
          (item?.email == user?.email || item?.parentDir !== ".") &&
          !item?.parentDir?.includes(user?.id)
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
  const { deleteProject, changeCurrentProjectRoot, archivedDeleteProject } =
    useFileStore((state) => ({
      deleteProject: state.deleteProject,
      changeCurrentProjectRoot: state.changeCurrentProjectRoot,
      archivedDeleteProject: state.archivedDeleteProject,
    }));

  //copy project
  const [sourceProject, setSourceProject] = useState("");
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const handleCopy = (title, parentDir) => {
    setSourceProject(title);
    setCopyDialogOpen(true);
    setParentDir(parentDir);
  };

  //rename project
  const [parentDir, setParentDir] = useState(".");
  const [renameSourceProject, setRenameSourceProject] = useState("");
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const handleRename = async (title, parentDir) => {
    const root = path.join(parentDir, title);
    const projectInfo = await getProjectInfo(root);
    if (!!projectInfo.isSync) {
      toast.warning(
        "This is a shared collaboration project. Renaming is prohibited"
      );
      return;
    }
    setRenameSourceProject(title);
    setRenameDialogOpen(true);
    setParentDir(parentDir);
  };

  // share project
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareProjectName, setShareProjectName] = useState("");

  const controlShare = useCallback(
    (project) => {
      authCallback(async () => {
        const [newRoomId, newRoomPath] = await getShareProjectInfo(
          project,
          user.id
        );
        setShareProjectName(newRoomPath);
        setShareDialogOpen(true);
      }, "Please login first");
    },
    [authCallback, user]
  );

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
    await archivedDeleteProject({
      dirpath: path.join(parentDir, deleteProjectName),
    });
    toast.success("trash project success");
    getProjectList();
    setDeleteDialogOpen(false);
  };

  const deleteProjectRemote = async (id, callback) => {
    try {
      let res = await deleteProjectService(id);
      console.log(res, "res");
      callback && callback();
    } catch {
      toast.success("delete project failed");
    }
  };

  const handleTrashDelete = async () => {
    let projectName = path.join(parentDir, deleteProjectName);

    const callback = async () => {
      await deleteProject({ dirpath: projectName });
      toast.success("delete project success");
      getProjectList();
      setDeleteDialogOpen(false);
    };

    let info = await getProjectInfo(projectName);
    await deleteProjectRemote(info.project_id, callback);
  };

  const handleDeleteProject = (deleteProjectName, parentDir = ".") => {
    if (!deleteProjectName) {
      toast.error("Please select a project to delete");
      return;
    }
    setDeleteDialogOpen(true);
    setDeleteProjectName(deleteProjectName);
    setParentDir(parentDir);
  };

  // sync project
  const [projectSync, setProjectSync] = useState(null);

  const [syncDialogOpen, setSyncDialogOpen] = useState(false);

  const [syncParams, setSyncParams] = useState({});

  const handleSyncProject = async (syncProjectName, roomId) => {
    setSyncParams({ roomId: roomId, project: syncProjectName });
    setSyncDialogOpen(true);
  };

  const getYDocTokenReq = async (room) => {
    const res = await getYDocToken(room);
    return res;
  };

  const [loading, setLoading] = useState(false);

  const handleConfirmSync = async () => {
    const parentDir = getShareUserStoragePath(syncParams.roomId);
    const { token, position } = await getYDocTokenReq(
      syncParams.project + syncParams.roomId
    );
    const projectSync = new ProjectSync(
      syncParams.project,
      user,
      syncParams.roomId,
      token,
      position,
      getProjectList,
      true,
      parentDir
    );
    await projectSync.setObserveHandler();
    setLoading(true);
    waitForCondition({
      condition: () => projectSync.isInitialSyncComplete,
      onSuccess: () => {
        setLoading(false);
        setSyncDialogOpen(false);
      },
      onFailure: () => {
        setLoading(false);
        setSyncDialogOpen(false);
        toast.error("Sync failed, please try again.");
      },
      intervalTime: 100,
      maxElapsedTime: 60000,
    });
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
    (async function () {
      await initShareProject();
      await getProjectList();
    })();

    return () => {
      if (projectSync) {
        projectSync?.leaveCollaboration && projectSync?.leaveCollaboration();
      }
    };
  }, []);

  //github
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

  const handleGithub = (open, projectName) => {
    setGithubDialogOpen(open);
    setProjectName(projectName);
  };

  //get project list
  const getProjectList = async () => {
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

  // slider menu
  const [currentSelectMenu, setCurrentSelectMenu] = useState("all");

  useEffect(() => {
    getProjectList();
  }, [currentSelectMenu, user]);

  const getAllProjectRemote = async () => {
    let list = await getProjectViaOwner();
    console.log(list, "list");
    if (!list || list?.length < 1) return;
    for (let project of list) {
      let isExistPath = await existsPath(project.project_name);
      if (project.is_sync && !isExistPath) {
        await getAllProjectFromYjs(project.project_name, project.owner_id);
      }
    }
  };

  const getAllProjectFromYjs = useCallback(async (project, roomId) => {
    const { token, position } = await getYDocTokenReq(project + roomId);
    const projectSync = new ProjectSyncDownload(
      project,
      roomId,
      token,
      () => {
        console.log("aaaaaa");
        getProjectList();
      },
      parentDir,
      true
    );
  }, []);

  useEffect(() => {
    getAllProjectRemote();
  }, []);


  return (
    <div className="w-full flex  bg-white h-full overflow-hidden">
      <div className="flex flex-col w-1/5 h-full overflow-y-auto">
        <Slide
          currentSelectMenu={currentSelectMenu}
          setCurrentSelectMenu={setCurrentSelectMenu}
          user={user}
          getProjectList={getProjectList}
        ></Slide>
      </div>
      <div className="flex flex-col w-4/5 px-8 h-full overflow-y-auto">
        <Content
          user={user}
          currentSelectMenu={currentSelectMenu}
          setCurrentSelectMenu={setCurrentSelectMenu}
          getProjectList={getProjectList}
          handleCopy={handleCopy}
          projectData={projectData}
          handleRename={handleRename}
          setIsTrashDelete={setIsTrashDelete}
          handleDeleteProject={handleDeleteProject}
          auth={auth}
          handleGithub={handleGithub}
          controlShare={controlShare}
          changeCurrentProjectRoot={changeCurrentProjectRoot}
          setGithubDialogOpen={setGithubDialogOpen}
          setIsGitDelete={setIsGitDelete}
        ></Content>
      </div>
      <>
        <CopyProject
          dialogOpen={copyDialogOpen}
          setDialogOpen={setCopyDialogOpen}
          sourceProject={sourceProject}
          setSourceProject={setSourceProject}
          getProjectList={getProjectList}
          parentDir={parentDir}
        />
        <RenameProject
          dialogOpen={renameDialogOpen}
          setDialogOpen={setRenameDialogOpen}
          sourceProject={renameSourceProject}
          setSourceProject={setRenameSourceProject}
          getProjectList={getProjectList}
          parentDir={parentDir}
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
          title={
            <span>
              <b>{user?.name}</b> would like you to join{" "}
              <i>{syncParams?.project}</i>
            </span>
          }
          dialogOpen={syncDialogOpen}
          handleCancel={handleCancelSync}
          buttonList={[
            { title: "Cancel", click: () => handleCancelSync() },
            { title: "Confirm", click: () => handleConfirmSync() },
          ]}
        >
          <ArLoadingOverlay text="Synchronizing" loading={loading}>
            <div className="text-gray-500 mr-1 ml-2 h-12 flex items-center">
              You are accepting this invite as&nbsp;<i>{user?.email}</i>
            </div>
          </ArLoadingOverlay>
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
    </div>
  );
};

export default React.memo(Project);
