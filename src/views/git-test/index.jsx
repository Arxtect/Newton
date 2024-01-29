/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
// Hooks
import React, { useLayoutEffect, useEffect } from "react";
import RootDirectory from "./components/RootDirectory"
import { mkdir, readDirectoryTree } from "../../domain/filesystem"
import useFileStore from '../../domain/filesystem/fileReduces/fileActions'


const GitTest = () => {

  const createProject = async () => {
    await mkdir('test')
  }

  useEffect(() => { createProject() }, [])
  const { touchCounter,
    isFileCreating,
    isDirCreating,
    fileMoved,
    startFileCreating,
    startDirCreating,
    deleteDirectory,
    editingFilepath, loadFile } = useFileStore((state) => ({
      touchCounter: state.touchCounter,
      isFileCreating: state.fileCreatingDir,
      isDirCreating: state.dirCreatingDir,
      fileMoved: state.fileMoved,
      startFileCreating: state.startFileCreating,
      startDirCreating: state.startDirCreating,
      deleteDirectory: state.deleteDirectory,
      editingFilepath: state.filepath,
      loadFile: state.loadFile
    }));

  useEffect(() => {
    readDirectoryTree('test').then(tree => {
      console.log(tree);
    }).catch(error => {
      console.error('读取目录树时出错:', error);
    });
  }, [])

  return (
    <main className="max-w-[20vw] m-[auto] mt-2">
      <RootDirectory
        // key={props.currentProjectRoot}
        // root={props.currentProjectRoot}
        // dirpath={props.currentProjectRoot}
        key={'test'}
        root={'test'}
        dirpath={'test'}
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
      />
    </main>
  );
};

export default GitTest;
