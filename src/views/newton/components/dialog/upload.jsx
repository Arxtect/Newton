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
import { uploadFile, uploadFolder, readFile } from "@/domain/filesystem";
import UploadFileIcon from "@mui/icons-material/UploadFileRounded";
import path from "path";
import DriveFolderUploadIcon from "@mui/icons-material/DriveFolderUploadRounded";
import { IconButton, Tooltip } from "@mui/material";
import uploadFileSvg from "@/assets/layout/uploadFile.svg";
import uploadFolderSvg from "@/assets/layout/uploadFolder.svg";
import ArIcon from "@/components/arIcon";

const FileUploader = forwardRef(
  (
    {
      reload,
      filepath,
      currentSelectDir,
      currentProject,
      projectSync,
      ...props
    },
    ref
  ) => {
    const handleFileChange = async (event) => {
      const currentPath = currentSelectDir
        ? currentSelectDir
        : !!filepath
        ? path.dirname(filepath)
        : currentProject;
      const fileList = event.target.files;
      const filesArray = Array.from(fileList);
      const filePaths = await uploadFile(filesArray, currentPath, reload);
      if (!!projectSync) {
        for (const filePath of filePaths) {
          const content = await readFile(filePath);
          await projectSync.syncFileToYMap(filePath, content);
        }
      }
      console.log(filePaths, "filePaths");
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
            {/* <UploadFileIcon fontSize="small" /> */}
            {/* <img src={uploadFileSvg} alt="" className="w-5 h-5" /> */}
            <ArIcon name={"UploadFile"} className="text-black w-5 h-5" />
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
  (
    {
      reload,
      filepath,
      currentSelectDir,
      currentProject,
      projectSync,
      ...props
    },
    ref
  ) => {
    const folderUploaderRef = useRef(null);

    const handleFolderChange = async (event) => {
      const currentPath = currentSelectDir
        ? currentSelectDir
        : !!filepath
        ? path.dirname(filepath)
        : currentProject;
      const folderList = event.target.files;
      const foldersArray = Array.from(folderList);

      const filePaths = await uploadFolder(foldersArray, currentPath, reload);
      if (!!projectSync) {
        for (const filePath of filePaths) {
          const content = await readFile(filePath);
          projectSync.syncFileToYMap(filePath, content);
        }

        await projectSync.syncFileTree();
      }
      console.log(filePaths, "filePaths");
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
            {/* <DriveFolderUploadIcon className="text-[#000]" fontSize="small" /> */}
            {/* <img src={uploadFolderSvg} alt="" className="w-5 h-5" /> */}
            <ArIcon name={"uploadFolder"} className="text-black w-5 h-5" />
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
