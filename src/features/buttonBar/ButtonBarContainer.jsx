// Hooks
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
// Components
import { ButtonBar } from "./ButtonBar";
import {
  revokeCompiledPdfUrl,
  compileLatex,
} from "../latexCompilation/latexCompilation";
import { toggleCompilerLog } from "../pdfPreview/pdfPreviewSlice.js";
import { useFileStore } from "store";

export const ButtonBarContainer = () => {
  // Select the URL of the PDF, the source code, and whether to show all of it
  const pdfUrl = useSelector((state) => state.pdfPreview);

  const { sourceCode, changeValue, currentProjectRoot } = useFileStore(
    (state) => ({
      sourceCode: state.value,
      changeValue: state.changeValue,
      currentProjectRoot: state.currentProjectRoot,
    })
  );

  const dispatch = useDispatch();

  // Revoke the PDF URL every 30000 milliseconds
  useEffect(() => {
    const timer = setTimeout(() => {
      revokeCompiledPdfUrl(pdfUrl);
    }, 30000);
    return () => clearTimeout(timer);
  }, [pdfUrl]);

  // const toggleVisibility = () => dispatch(toggleSourceCode());
  const compile = () => compileLatex(sourceCode, currentProjectRoot);

  const showLog = () => {
    dispatch(toggleCompilerLog());
  };

  return (
    <ButtonBar
      // toggleVisibility={toggleVisibility}
      compile={compile}
      showLog={showLog}
      // showFullSourceCode={showFullSourceCode}
    />
  );
};
