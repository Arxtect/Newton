/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 12:37:50
 */
// Hooks
import { useEffect, useState } from "react";
// Components
import LatexEditor from "./LatexEditor";
import { useFileStore } from "store";
import { getFilesRecursively } from "domain/filesystem";

export const LatexEditorContainer = () => {
  const {
    contents,
    changeValue,
    filepath,
    currentProjectFileList,
    currentProjectBibFilepathList,
  } = useFileStore((state) => ({
    contents: state.value,
    changeValue: state.changeValue,
    filepath: state.filepath,
    currentProjectFileList: state.currentProjectFileList,
    currentProjectBibFilepathList: state.currentProjectBibFilepathList,
  }));

  const handleChange = (editorValue) => {
    changeValue(editorValue);
  };

  return (
    <LatexEditor
      handleChange={handleChange}
      sourceCode={contents}
      filepath={filepath}
      fileList={currentProjectFileList}
      bibFilepathList={currentProjectBibFilepathList}
    />
  );
};
