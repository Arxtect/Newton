/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-31 18:28:07
 */
import React, { useState, useEffect, useRef } from "react";
import { uploadFile, uploadFolder } from "@/domain/filesystem";
import { IconButton, Tooltip } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import path from "path";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUpload";

const FileUploader = ({ reload, filepath, currentSelectDir, ...props }) => {
  const handleFileChange = (event) => {
    const currentPath = currentSelectDir
      ? currentSelectDir
      : path.dirname(filepath);
    const fileList = event.target.files;
    const filesArray = Array.from(fileList);
    uploadFile(filesArray, currentPath, reload);
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
const FolderUploader = ({ reload, filepath, currentSelectDir, ...props }) => {
  const folderUploaderRef = useRef(null);

  const handleFolderChange = (event) => {
    const currentPath = currentSelectDir
      ? currentSelectDir
      : path.dirname(filepath);
    const folderList = event.target.files;
    const foldersArray = Array.from(folderList);
    uploadFolder(foldersArray, currentPath, reload);
  };

  const handleButtonClick = () => {
    folderUploaderRef.current.click();
  };

  return (
    <div {...props} className="relative">
      <Tooltip title="Upload folder">
        <IconButton className="text-gray-700" onClick={handleButtonClick}>
          <DriveFolderUploadIcon />
        </IconButton>
      </Tooltip>
      <input
        type="file"
        directory="" // This attribute allows the selection of directories
        webkitdirectory="" // This is for Chrome support
        onChange={handleFolderChange}
        className="absolute opacity-0 w-px" // Tailwind classes for hidden input
        ref={folderUploaderRef}
      />
    </div>
  );
};

export { FileUploader, FolderUploader };
