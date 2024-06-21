/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
// Hooks
import React, { useLayoutEffect, useEffect, useState } from "react";
import RootDirectory from "./components/RootDirectory";
import { findAllProject, getProjectInfo } from "domain/filesystem";
import { useFileStore } from "store";
import { ProjectSync } from "@/convergence";
import RightBeforeLeft from "@/views/layout/rightBeforeLeft";

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
    updateProjectSync,
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
    updateProjectSync: state.updateProjectSync,
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

  const initShareProject = async () => {
    const projectInfo = await getProjectInfo(currentProjectRoot);

    const project = projectInfo["rootPath"];
    const roomId = projectInfo["userId"];

    if (!project || !roomId) return;
    const user = {
      id: "user1",
      name: "user1",
      email: "user@example.com",
      color: "#ff0000",
    };
    const projectSync = await new ProjectSync(
      project,
      user,
      roomId,
      (filePath, content) => {
        console.log("File changed:", filePath, content);
      }
    );
    updateProjectSync(projectSync);
    await projectSync.setObserveHandler();
  };

  useEffect(() => {
    initShareProject();
  }, []);

  return (
    <main className="max-w-[100%]">
      <div className="right-before flex pl-2 overflow-hidden">
        <RightBeforeLeft
          createProject={createProject}
          currentProject={currentProjectRoot}
          deleteProject={deleteProject}
          projectLists={allProject}
          reload={repoChanged}
          filepath={filepath}
          currentSelectDir={currentSelectDir}
        ></RightBeforeLeft>
      </div>
      {/* <div className="flex justify-between items-center h-[52px] border-gradient-top border-b border-g-color-87 border-1">
        <div className="flex gap-2 w-4/5 ">
          <DropdownFormWithIcon
            currentProjectRoot={currentProjectRoot}
            projectList={allProject}
            changeCurrentProjectRoot={changeCurrentProjectRoot}
          />
        </div>
        <div className="flex w-1/5 items-center">
          <MoreMenu
            createProject={createProject}
            currentProject={currentProjectRoot}
            deleteProject={deleteProject}
            projectLists={allProject}
            reload={repoChanged}
            filepath={filepath}
            currentSelectDir={currentSelectDir}
          ></MoreMenu>
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
      </div> */}
      {/* <button onClick={() => gitClone()}>git clone </button> <div></div>
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
      </button> */}
      {/* <BottomDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} /> */}
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
