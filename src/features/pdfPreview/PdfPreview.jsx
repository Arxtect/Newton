/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 12:25:23
 */
// Hooks
import { useEffect, useState } from "react";
import { usePdfPreviewStore, useFileStore, useLayout } from "store";
import AssetPreview from "../assetPreview/assetPreview";

export const PdfPreview = () => {
  const { pdfUrl, compilerLog, showCompilerLog, setCompiledPdfUrl } =
    usePdfPreviewStore((state) => ({
      pdfUrl: state.pdfUrl,
      compilerLog: state.compilerLog,
      showCompilerLog: state.showCompilerLog,
      setCompiledPdfUrl: state.setCompiledPdfUrl,
    }));

  const { willResizing } = useLayout();

  const { assetValue, assetsFilePath } = useFileStore((state) => ({
    assetValue: state.assetValue,
    assetsFilePath: state.assetsFilePath,
  }));

  const formattedCompilerLog = (
    <p className="h-full  p-2 font-mono overflow-y-scroll">
      <b>Compiler Log:</b>
      <br />
      <br />
      {compilerLog}
    </p>
  );

  const pdfEmbed = (
    <embed
      src={pdfUrl}
      width="100%"
      type="application/pdf"
      className="h-full"
    ></embed>
  );

  useEffect(() => {
    console.log(willResizing, "willResizing");
  }, [willResizing]);

  return (
    <div
      className={`h-full relative ${willResizing ? "z-10" : ""}`}
      style={{ overflow: "auto" }} // 添加这一行以允许滚动
    >
      {!!assetValue && !!assetsFilePath ? (
        <AssetPreview filename={assetsFilePath} content={assetValue} />
      ) : pdfUrl === "" || showCompilerLog ? (
        formattedCompilerLog
      ) : (
        pdfEmbed
      )}

      {willResizing && (
        <div className="absolute top-0 left-0 w-full h-full z-20"></div>
      )}
    </div>
  );
};
