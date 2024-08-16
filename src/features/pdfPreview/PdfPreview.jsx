/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 12:25:23
 */
// Hooks
import { useEffect, useState } from "react";
import { usePdfPreviewStore, useFileStore, useLayout } from "store";
import AssetPreview from "../assetPreview/assetPreview";
import { readFile } from "domain/filesystem";

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
      type="application/pdf"
      style={{ width: "100%", height: "100%" }}
    />
  );

  useEffect(() => {
    console.log(willResizing, "willResizing");
  }, [willResizing]);

  const [fileContent, setFileContent] = useState("")

  useEffect(() => {
    if (!assetsFilePath && assetsFilePath == "") return
    console.log(
      assetsFilePath,
      "assetsFilePath"
    );
      (async () => {
      const content = await readFile(assetsFilePath);
      setFileContent(content);
    })();
  
  }, [assetsFilePath])

  return (
    <div
      className={`h-full relative ${willResizing ? "z-10" : ""}`}
      style={{ overflow: "auto" }} // 添加这一行以允许滚动
    >
      {!!assetsFilePath && !!fileContent ? (
        <AssetPreview filename={assetsFilePath} content={fileContent} />
      ) : showCompilerLog ? (
        formattedCompilerLog
      ) : (
        pdfUrl !== "" &&
        pdfEmbed
        // <Viewer url={pdfU/rl}></Viewer>
      )}

      {willResizing && (
        <div className="absolute top-0 left-0 w-full h-full z-20"></div>
      )}
    </div>
  );
};
