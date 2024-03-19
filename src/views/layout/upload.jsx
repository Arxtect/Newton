/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-31 18:28:07
 */
import React, {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { uploadFile, uploadFolder } from "@/domain/filesystem";
import UploadFileIcon from "@mui/icons-material/UploadFileRounded";
import path from "path";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUploadRounded";
import { IconButton, Tooltip } from "@mui/material";

const FileUploader = forwardRef(
  ({ reload, filepath, currentSelectDir, ...props }, ref) => {
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
    useImperativeHandle(ref, () => ({
      click: handleButtonClick,
    }));

    return (
      <div {...props} className="position-relative">
        <Tooltip title={props.title}>
          <IconButton color="#inherit" aria-label="controls" size="small">
            <UploadFileIcon className="text-[#000]" fontSize="small" />
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
  }
);

const FolderUploader = forwardRef(
  ({ reload, filepath, currentSelectDir, ...props }, ref) => {
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

    useImperativeHandle(ref, () => ({
      click: handleButtonClick,
    }));

    return (
      <div {...props} className="relative">
        <Tooltip title={props.title}>
          <IconButton color="#inherit" aria-label="controls" size="small">
            <DriveFolderUploadIcon className="text-[#000]" fontSize="small" />
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
  }
);

export { FileUploader, FolderUploader };
