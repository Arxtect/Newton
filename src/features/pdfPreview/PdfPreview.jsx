/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 12:25:23
 */
// Hooks
import { useEffect } from "react";
import { usePdfPreviewStore } from "store";

export const PdfPreview = () => {
  const { pdfUrl, compilerLog, showCompilerLog, setCompiledPdfUrl } =
    usePdfPreviewStore((state) => ({
      pdfUrl: state.pdfUrl,
      compilerLog: state.compilerLog,
      showCompilerLog: state.showCompilerLog,
      setCompiledPdfUrl: state.setCompiledPdfUrl,
    }));

  const formattedCompilerLog = (
    <p className="h-minus-125 border border-black p-2 font-mono overflow-y-scroll">
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
      className="h-minus-125 border border-black"
    ></embed>
  );
  useEffect(() => {
    console.log(pdfUrl);
  }, [pdfUrl]);

  return (
    <article>
      {pdfUrl !== "" && !showCompilerLog && pdfEmbed}
      {(pdfUrl === "" || showCompilerLog) && formattedCompilerLog}
    </article>
  );
};
