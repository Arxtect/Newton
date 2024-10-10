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
export const LatexEditorContainer = () => {
  const { contents, changeValue, filepath, mainFilepath } = useFileStore(
    (state) => ({
      contents: state.value,
      changeValue: state.changeValue,
      filepath: state.filepath,
      mainFilepath: state.mainFilepath,
    })
  );

  const handleChange = (editorValue) => {
    changeValue(editorValue);
  };

  return (
    <LatexEditor
      handleChange={handleChange}
      sourceCode={contents}
      filepath={mainFilepath}
    />
  );
};
