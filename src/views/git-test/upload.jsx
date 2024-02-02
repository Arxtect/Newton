/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-31 18:28:07
 */
import React, { useState, useEffect, useRef } from "react";
import UpLoadFile from "@/domain/filesystem/commands/upLoadFile";
import { IconButton, Tooltip } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import path from "path";
const FileUploader = ({ reload, filepath, currentSelectDir, ...props }) => {
  const handleFileChange = (event) => {
    const currentPath = currentSelectDir
      ? currentSelectDir
      : path.dirname(filepath);
    const fileList = event.target.files;
    const filesArray = Array.from(fileList);
    UpLoadFile(filesArray, currentPath, reload);
  };

  const fileUploaderRef = useRef(null);

  const handleButtonClick = () => {
    fileUploaderRef.current.click();
  };

  return (
    <div {...props} className="position-relative">
      <Tooltip title="upload file">
        <IconButton
          className="text-gray-700"
          onClick={() => {
            handleButtonClick();
          }}
        >
          <UploadFileIcon />
        </IconButton>
      </Tooltip>
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        style={{ position: "absolute", opacity: "0", width: "0.1px" }}
        ref={fileUploaderRef}
      />
    </div>
  );
};

export default FileUploader;
