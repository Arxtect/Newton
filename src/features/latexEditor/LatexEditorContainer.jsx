// Hooks
import { useEffect, useCallback } from "react";
// Components
import LatexEditor from "./LatexEditor";
import { useFileStore } from "store";
export const LatexEditorContainer = () => {
  const { contents, changeValue, filepath } = useFileStore((state) => ({
    contents: state.value,
    changeValue: state.changeValue,
    filepath:state.filepath
  }));

  const handleChange = (editorValue) => {
    changeValue(editorValue);
  };

  return <LatexEditor handleChange={handleChange} sourceCode={contents} filepath={filepath} />;
};
