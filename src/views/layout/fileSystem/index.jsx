/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
// Hooks
import React, { useLayoutEffect, useEffect, useState } from "react";
import RootDirectory from "./components/RootDirectory";
import { findAllProject, getProjectInfo } from "domain/filesystem";
import { useFileStore, useUserStore } from "store";
import { ProjectSync } from "@/convergence";
import { getYDocToken } from "services";
import { gitCloneGitea } from "./gitclone";
import {getRoomUserAccess} from "@/services"
import { toast } from "react-toastify";

import { useNavigate } from "react-router-dom";

const FileSystem = () => {
        const navigate = useNavigate();
  const {
    filepath,
    currentProjectRoot,
    changeCurrentProjectRoot,
    createProject,
    touchCounter,
    isFileCreating,
    isDirCreating,
    fileMoved,
    startFileCreating,
    startDirCreating,
    deleteDirectory,
    editingFilepath,
    loadFile,
    currentSelectDir,
    changeCurrentSelectDir,
    renamingPathname,
    startRenaming,
    endRenaming,
    preRenamingDirpath,
    changePreRenamingDirpath,
    repoChanged,
    deleteProject,
    allProject,
    updateAllProject,
    projectSync,
    updateProjectSync,
    updateShareIsRead,
  } = useFileStore((state) => ({
    filepath: state.filepath,
    currentProjectRoot: state.currentProjectRoot,
    changeCurrentProjectRoot: state.changeCurrentProjectRoot,
    createProject: state.createProject,
    touchCounter: state.touchCounter,
    isFileCreating: state.fileCreatingDir,
    isDirCreating: state.dirCreatingDir,
    fileMoved: state.fileMoved,
    startFileCreating: state.startFileCreating,
    startDirCreating: state.startDirCreating,
    deleteDirectory: state.deleteDirectory,
    editingFilepath: state.filepath,
    loadFile: state.loadFile,
    currentSelectDir: state.currentSelectDir,
    changeCurrentSelectDir: state.changeCurrentSelectDir,
    renamingPathname: state.renamingPathname,
    startRenaming: state.startRenaming,
    endRenaming: state.endRenaming,
    preRenamingDirpath: state.preRenamingDirpath,
    changePreRenamingDirpath: state.changePreRenamingDirpath,
    repoChanged: state.repoChanged,
    deleteProject: state.deleteProject,
    allProject: state.allProject,
    updateAllProject: state.updateAllProject,
    projectSync: state.projectSync,
    updateProjectSync: state.updateProjectSync,
    updateShareIsRead: state.updateShareIsRead,
  }));

  const getAllProject = async () => {
    let projectLists = await findAllProject(".");
    if (projectLists.length > 0) {
      console.log(projectLists, "projectLists");
      updateAllProject(projectLists);
    }
  };

  const { user } = useUserStore((state) => ({
    user: state.user,
  }));

  useEffect(() => {
    getAllProject();
  }, [currentProjectRoot]);

  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = (open) => {
    setIsOpen(open);
  };
  const getYDocTokenReq = async () => {
    const token = await getYDocToken();
    console.log(token, "token");
    return token;
  };
  const initShareProject = async () => {
    const projectInfo = await getProjectInfo(currentProjectRoot);

    const project = projectInfo?.["rootPath"];
    const roomId = projectInfo?.["userId"];
    const isSync = projectInfo?.["isSync"];

    console.log(projectInfo, "projectInfo");

    if (!isSync || !project || !roomId) return;
    const res = await getRoomUserAccess({
      project_name: project+roomId,
    });
    if (res?.status != "success") {
      toast.error("Get room user access failed.");
      return;
    }

    if (res?.access == "r") {
      updateShareIsRead(true);
      toast.info(
        "The project is read-only for you, please contact your project manager to modify it."
      );
    }

    if (res?.access == "no") {
      toast.info(
        "The project is not shared for you, please contact your project manager to modify it."
      );
      navigate("/project");
      return
    }

    const token = await getYDocTokenReq();
    const projectSync = await new ProjectSync(project, user, roomId, token);
    updateProjectSync(projectSync);
  };

  useEffect(() => {
    initShareProject();
  }, []);

  return (
    <main className="max-w-[100%] h-full">

      <div className="overflow-auto h-full mr-3">
        <RootDirectory
          key={currentProjectRoot}
          root={currentProjectRoot}
          dirpath={currentProjectRoot}
          depth={0}
          touchCounter={touchCounter}
          isFileCreating={isFileCreating}
          isDirCreating={isDirCreating}
          fileMoved={fileMoved}
          startFileCreating={startFileCreating}
          startDirCreating={startDirCreating}
          deleteDirectory={deleteDirectory}
          editingFilepath={editingFilepath}
          open={true}
          loadFile={loadFile}
          currentSelectDir={currentSelectDir}
          changeCurrentSelectDir={changeCurrentSelectDir}
          startRenaming={startRenaming}
          endRenaming={endRenaming}
          renamingPathname={renamingPathname}
          preRenamingDirpath={preRenamingDirpath}
          changePreRenamingDirpath={changePreRenamingDirpath}
          changeCurrentProjectRoot={changeCurrentProjectRoot}
        />
      </div>
    </main>
  );
};

export default React.memo(FileSystem);
