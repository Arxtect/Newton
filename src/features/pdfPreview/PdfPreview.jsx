/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 12:25:23
 */
// Hooks
import { useEffect, useState } from "react";
import { usePdfPreviewStore, useFileStore, useLayout } from "store";
import AssetPreview from "../assetPreview/assetPreview";
import FormattedCompilerLog from "./formattedCompilerLog";
import PdfPreViewer from "./PdfPreViewer";

export const PdfPreview = () => {
  const {
    pdfUrl,
    compilerLog,
    showCompilerLog,
    setCompiledPdfUrl,
    compileMessages,
  } = usePdfPreviewStore((state) => ({
    pdfUrl: state.pdfUrl,
    compilerLog: state.compilerLog,
    showCompilerLog: state.showCompilerLog,
    setCompiledPdfUrl: state.setCompiledPdfUrl,
    compileMessages: state.compileMessages,
  }));

  const { willResizing } = useLayout();


  return (
    <div
      className={`h-full relative  ${willResizing ? "z-10" : ""}`}
      style={{ overflow: "auto" }} // 添加这一行以允许滚动
    >
      {showCompilerLog ? (
        <FormattedCompilerLog messages={compileMessages} log={compilerLog} />
      ) : (
        pdfUrl !== "" && <PdfPreViewer pdfUrl={pdfUrl} />
        // <Viewer url={pdfU/rl}></Viewer>
      )}

      {willResizing && (
        <div className="absolute top-0 left-0 w-full h-full z-20"></div>
      )}
    </div>
  );
};
