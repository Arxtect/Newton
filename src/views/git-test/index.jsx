/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
// Hooks
import React, { useLayoutEffect, useEffect } from "react";
import RootDirectory from "./components/RootDirectory";
import { mkdir, readDirectoryTree } from "../../domain/filesystem";
import useFileStore from "../../domain/filesystem/fileReduces/fileActions";
import { IconButton } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import Tooltip from "@mui/material/Tooltip";
import UpLoadFile from "../../domain/filesystem/commands/upLoadFile";
import FileUploader from "./upload.jsx";

const GitTest = () => {
  const createProject = async () => {
    await mkdir("test");
  };

  useEffect(() => {
    createProject();
  }, []);
  const {
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

  useEffect(() => {
    readDirectoryTree("test")
      .then((tree) => {
        console.log(tree);
      })
      .catch((error) => {
        console.error("读取目录树时出错:", error);
      });
  }, []);

  return (
    <main className="max-w-[20vw] m-[auto] mt-2">
      <FileUploader></FileUploader>
      <div className="flex justify-end items-center">
        <div className="flex gap-2">
          <Tooltip title="uplaod">
            <IconButton
              size="small"
              className="text-gray-700"
              onClick={() => {
                /* handle export logic */
              }}
            >
              <CloudUploadIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>

          <Tooltip title="uplaod">
            <IconButton
              size="small"
              className="text-gray-700"
              onClick={() => {
                /* handle export logic */
              }}
            >
              <CloudDownloadIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </div>
      </div>
      <RootDirectory
        // key={props.currentProjectRoot}
        // root={props.currentProjectRoot}
        // dirpath={props.currentProjectRoot}
        key={"test"}
        root={"test"}
        dirpath={"test"}
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
      />
    </main>
  );
};

export default GitTest;
