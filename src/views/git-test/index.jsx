/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
// Hooks
import React, { useLayoutEffect, useEffect, useState } from "react";
import RootDirectory from "./components/RootDirectory";
import {
  mkdir,
  readDirectoryTree,
  downloadDirectoryAsZip,
  findAllProject,
} from "domain/filesystem";
import { useFileStore } from "store";
import { IconButton, Tooltip } from "@mui/material";
import IosShareIcon from "@mui/icons-material/IosShare";
import MoreMenu from "./components/moreMenu.js";

import { FileUploader, FolderUploader } from "./upload.jsx";
import DropdownFormWithIcon from "./components/DropdownFormWithIcon.jsx";

import { gitClone, linkRepo, commitFile, gitPush } from "./gitclone.js";
import BottomDrawer from "@/features/bottomDrawer/bottomDrawer";

const GitTest = () => {
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
  }));
  const getAllProject = async () => {
    let projectLists = await findAllProject(".");
    if (projectLists.length > 0) {
      console.log(projectLists, "projectLists");
      updateAllProject(projectLists);
    }
  };

  useEffect(() => {
    getAllProject();
  }, [currentProjectRoot]);

  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = (open) => {
    setIsOpen(open);
  };

  return (
    <main className="max-w-[100%]">
      <div className="flex justify-between items-center bg-[#e7f8fd] h-[52px] pr-3 border-gradient-top">
        <div className="flex gap-2 w-3/5">
          <DropdownFormWithIcon
            currentProjectRoot={currentProjectRoot}
            projectList={allProject}
            changeCurrentProjectRoot={changeCurrentProjectRoot}
          />
        </div>
        <div className="flex w-2/5 flex-row-reverse">
          <MoreMenu
            createProject={createProject}
            currentProject={currentProjectRoot}
            deleteProject={deleteProject}
            projectLists={allProject}
          ></MoreMenu>
          {/* <Tooltip title="export project">
            <IconButton
              className="text-gray-700"
              onClick={() => {
                downloadDirectoryAsZip(currentProjectRoot);
              }}
            >
              <IosShareIcon fontSize="inherit" />
            </IconButton>
          </Tooltip> */}
          <FolderUploader
            reload={repoChanged}
            filepath={filepath}
            currentSelectDir={currentSelectDir}
          ></FolderUploader>
          <FileUploader
            reload={repoChanged}
            filepath={filepath}
            currentSelectDir={currentSelectDir}
          ></FileUploader>
        </div>
      </div>
      <button onClick={() => gitClone()}>git clone </button> <div></div>
      <button onClick={() => linkRepo()}>git link </button> <div></div>
      <button onClick={() => commitFile(currentProjectRoot, "test commit")}>
        commit
      </button>
      <div></div>
      <button onClick={() => gitPush(currentProjectRoot, "test commit")}>
        push
      </button>
      <div></div>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300"
        onClick={() => toggleDrawer(true)}
      >
        打开抽屉
      </button>
      <BottomDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} />
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
    </main>
  );
};

export default React.memo(GitTest);
