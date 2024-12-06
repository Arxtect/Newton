/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 12:25:23
 */
// Hooks
import { useEffect } from "react";
// Components
import { ButtonBar } from "./ButtonBar";
import { compileLatex } from "../latexCompilation/latexCompilation";
import { useFileStore } from "store";
import { usePdfPreviewStore, revokeCompiledPdfUrl } from "store";

export const ButtonBarContainer = () => {
  const { pdfUrl, toggleCompilerLog } = usePdfPreviewStore((state) => ({
    pdfUrl: state.pdfUrl,
    toggleCompilerLog: state.toggleCompilerLog,
  }));
  const { sourceCode, currentProjectRoot } = useFileStore(
    (state) => ({
      sourceCode: state.value,
      currentProjectRoot: state.currentProjectRoot,
    })
  );

  // Revoke the PDF URL every 30000 milliseconds
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     revokeCompiledPdfUrl(pdfUrl);
  //   }, 300000);
  //   return () => clearTimeout(timer);
  // }, [pdfUrl]);

  // const toggleVisibility = () => dispatch(toggleSourceCode());
  const compile = () => compileLatex(sourceCode, currentProjectRoot);

  const showLog = () => {
    toggleCompilerLog();
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
