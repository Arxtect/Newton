/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 12:25:23
 */
// Hooks
import { useEffect, useState } from "react";
import { usePdfPreviewStore } from "store";

export const PdfPreview = () => {
  const { pdfUrl, compilerLog, showCompilerLog, setCompiledPdfUrl } =
    usePdfPreviewStore((state) => ({
      pdfUrl: state.pdfUrl,
      compilerLog: state.compilerLog,
      showCompilerLog: state.showCompilerLog,
      setCompiledPdfUrl: state.setCompiledPdfUrl,
    }));

  const [resizing, setResizing] = useState(false);

  const resizeFrameStart = () => {
    setResizing(true);
  };

  const resizeDone = () => {
    setResizing(false);
  };

  useEffect(() => {
    if (resizing) {
      window.addEventListener("mousemove", resizeFrameStart);
      window.removeEventListener("mouseup", resizeDone);
    } else {
      window.addEventListener("mousemove", resizeFrameStart);
      window.removeEventListener("mouseup", resizeDone);
    }

    return () => {
      window.removeEventListener("mouseup", resizeDone);
    };
  }, [resizing]);

  const formattedCompilerLog = (
    <p className="h-full  p-2 font-mono overflow-y-scroll">
      <b>Compiler Log:</b>
      <br />
      <br />
      {compilerLog}
    </p>
  );
  const pdfEmbed = (
    <div
      onMouseDown={resizeFrameStart}
      className={`h-full relative ${resizing ? "z-10" : ""}`}
    >
      <embed
        src={pdfUrl}
        width="100%"
        type="application/pdf"
        className="h-full"
      ></embed>
      {resizing && (
        <div className="absolute top-0 left-0 w-full h-full z-20"></div>
      )}
    </div>
  );

  return (
    <div className="h-full">
      {pdfUrl !== "" && !showCompilerLog && pdfEmbed}
      {(pdfUrl === "" || showCompilerLog) && formattedCompilerLog}
    </div>
  );
};
