// Hooks
import { useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
// Components
import LatexEditor from "./LatexEditor";
import { useFileStore } from "store";
export const LatexEditorContainer = () => {
  const { contents, changeValue } = useFileStore((state) => ({
    contents: state.value,
    changeValue: state.changeValue,
  }));

  const handleChange = (editorValue) => {
    changeValue(editorValue);
  };

  return <LatexEditor handleChange={handleChange} sourceCode={contents} />;
};
