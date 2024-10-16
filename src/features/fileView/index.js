import React, { useState, useCallback, useEffect } from "react";
import path from "path";

import FileViewHeader from "./FileViewHeader";
import FileViewImage from "./FileViewImage";
import FileViewPdf from "./FileViewPdf";
import { readFile } from "domain/filesystem";

const imageExtensions = ["png", "jpg", "jpeg", "gif"];

function FileView({ filename }) {
  const [fileContent, setFileContent] = useState("");

  useEffect(() => {
    setFileContent("");
    if (!filename && filename == "") return;
    (async () => {
      const content = await readFile(filename);
      setFileContent(content);
    })();
  }, [filename]);

  const [contentLoading, setContentLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const basename = path.basename(filename);
  const extension = path.extname(filename).slice(1).toLowerCase();

  const isImageFile = imageExtensions.includes(extension);
  const isPdfFile = extension === "pdf";
  const isUnpreviewableFile = !isImageFile && !isPdfFile;

  let formattedContent = Uint8Array.from(fileContent.data ?? fileContent);
  const url = URL.createObjectURL(
    new Blob([formattedContent], {
      type: isImageFile ? `image/${extension}` : "application/pdf",
    })
  );

  const handleLoad = useCallback(() => {
    setContentLoading(false);
  }, []);

  const handleError = useCallback(
    (e) => {
      if (!hasError) {
        setContentLoading(false);
        setHasError(true);
      }
    },
    [hasError]
  );

  const contentView = (
    <>
      <FileViewHeader filename={filename} url={url} />
      {isImageFile && (
        <FileViewImage
          filename={filename}
          url={url}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
      {isPdfFile && (
        <FileViewPdf
          filename={filename}
          url={url}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </>
  );

  if (!fileContent) return;

  return (
    <div className="bg-white overflow-auto p-3 text-center absolute bottom-0 left-0 right-0 top-0 z-10">
      {!hasError && contentView}
      {(isUnpreviewableFile || hasError) && (
        <p className="no-preview">{"Sorry, no preview is available."}</p>
      )}
    </div>
  );
}

export default React.memo(FileView);
