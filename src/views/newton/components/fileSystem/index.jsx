/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
// Hooks
import React, { useLayoutEffect, useEffect, useState } from "react";
import RootDirectory from "./components/RootDirectory";
import { useFileStore } from "store";

const FileSystem = () => {
  const {
    currentProjectRoot,
    changeCurrentProjectRoot,
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
  } = useFileStore((state) => ({
    currentProjectRoot: state.currentProjectRoot,
    changeCurrentProjectRoot: state.changeCurrentProjectRoot,
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
  }));

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
