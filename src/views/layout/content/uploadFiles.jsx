/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-06 22:15:21
 */
import React, { useState, useCallback } from "react";
import { useFileStore } from "store";
import { toast } from "react-toastify";
import { uploadZip } from "domain/filesystem";
import path from "path";
import { useNavigate } from "react-router-dom";
import FileUploader from "@/features/uploadFiles";
import { IconButton, Tooltip } from "@mui/material";
import uploadFileSvg from "@/assets/layout/uploadFile.svg";
import { uploadFile, uploadFolder, readFile } from "@/domain/filesystem";

const UploadFiles = ({
  user,
  title,
  reload,
  filepath,
  currentSelectDir,
  currentProject,
  projectSync,
}) => {
  const { repoChanged, updateIsDropFileSystem } = useFileStore((state) => ({
    repoChanged: state.repoChanged,
    updateIsDropFileSystem: state.updateIsDropFileSystem,
  }));

  const [uploadProgress, setUploadProgress] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCancelUpload = () => {
    updateIsDropFileSystem(true);
    setDialogOpen(false);
  };

  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const items = event.dataTransfer.items;
    const fileList = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry();
      if (item && item.isDirectory) {
        await readDirectory(item, fileList);
      } else if (item && item.isFile) {
        fileList.push(await getFileWithRelativePath(item));
      }
    }

    handleUpload(fileList);
  }, []);

  const readDirectory = (directoryEntry, fileList) => {
    return new Promise((resolve) => {
      const reader = directoryEntry.createReader();
      reader.readEntries(async (entries) => {
        for (const entry of entries) {
          if (entry.isDirectory) {
            await readDirectory(entry, fileList);
          } else if (entry.isFile) {
            fileList.push(await getFileWithRelativePath(entry));
          }
        }
        resolve();
      });
    });
  };

  const getFileWithRelativePath = (fileEntry) => {
    return new Promise((resolve) => {
      fileEntry.file((file) => {
        // Create a new object to store the file and its relative path
        const fileWithRelativePath = {
          file,
          webkitRelativePath: fileEntry.fullPath,
        };
        resolve(fileWithRelativePath);
      });
    });
  };
  const handleUpload = async (files) => {
    console.log(files, "files");
    const currentPath = currentSelectDir
      ? currentSelectDir
      : !!filepath
      ? path.dirname(filepath)
      : currentProject;

    console.log(currentPath, currentSelectDir, "currentPath");
    const fileList = files;
    const filesArray = Array.from(fileList);
    const filePaths = await uploadFile(filesArray, currentPath, reload);
    if (!!projectSync) {
      for (const filePath of filePaths) {
        const content = await readFile(filePath);
        projectSync.syncFileToYMap(filePath, content);
      }
    }
    console.log(filePaths, "filePaths");
    handleCancelUpload();
  };

  return (
    <>
      <Tooltip title={title}>
        <IconButton
          color="#inherit"
          aria-label="controls"
          size="small"
          onClick={() => {
            updateIsDropFileSystem(false);
            setDialogOpen(true);
          }}
        >
          <img src={uploadFileSvg} alt="" className="w-5 h-5" />
        </IconButton>
      </Tooltip>
      <FileUploader
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        user={user}
        repoChanged={repoChanged}
        handleUpload={handleUpload}
        uploadProgress={uploadProgress}
        otherHandleInCancle={() => updateIsDropFileSystem(true)}
        type="files"
        title={"Upload files"}
        handleDrop={handleDrop}
      ></FileUploader>
    </>
  );
};

export default UploadFiles;
