/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-08-16 16:19:52
 */
import React, { useEffect, useState } from "react";
import path from "path";
import FileViewer from "react-file-viewer";
// import { CustomErrorComponent } from "custom-error";

const AutoPreview = React.memo(({ filename, content }) => {
  const [fileUrl, setFileUrl] = useState(null);

    useEffect(() => {
      console.log(filename, "filename");
      console.log(content, "content");
    if (!filename || (!content && !content.data)) {
      setFileUrl(null);
      return;
    }

    const fileExtension = path.extname(filename).slice(1).toLowerCase();
    const formattedContent = Uint8Array.from(content.data ?? content);

    const fileExtensionToTypeMap = {
      pdf: "pdf",
      doc: "doc",
      docx: "docx",
      xls: "xls",
      xlsx: "xlsx",
      ppt: "ppt",
      pptx: "pptx",
      jpg: "jpg",
      jpeg: "jpeg",
      png: "png",
      gif: "gif",
      bmp: "bmp",
    };

    const fileType = fileExtensionToTypeMap[fileExtension];

    if (!fileType) {
      setFileUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(new Blob([formattedContent]));
    setFileUrl(objectUrl);

    // Clean up the URL object when the component unmounts or dependencies change
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [filename, content]);

  if (!fileUrl) {
    return <div>Unsupported file type or missing content</div>;
  }

  const fileExtension = path.extname(filename).slice(1).toLowerCase();
  const fileExtensionToTypeMap = {
    pdf: "pdf",
    doc: "doc",
    docx: "docx",
    xls: "xls",
    xlsx: "xlsx",
    ppt: "ppt",
    pptx: "pptx",
    jpg: "jpg",
    jpeg: "jpeg",
    png: "png",
    gif: "gif",
    bmp: "bmp",
  };
  const fileType = fileExtensionToTypeMap[fileExtension];

  return (
    <FileViewer
      fileType={fileType}
      filePath={fileUrl}
      //   errorComponent={CustomErrorComponent}
      onError={(e) => console.error(e)}
    />
  );
});

export default AutoPreview;
