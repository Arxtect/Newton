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
import { IconButton } from "@mui/material";
import { uploadFile, uploadFolder, readFile } from "@/domain/filesystem";
import Tooltip from "@/components/tooltip";
import ArIcon from "@/components/arIcon";

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

    const fileListPromises = Array.from(items).map(async (item) => {
      const entry = await item.webkitGetAsEntry();
      if (entry) {
        if (entry.isDirectory) {
          return readDirectory(entry);
        } else if (entry.isFile) {
          return getFileWithRelativePath(entry);
        }
      } else {
        console.warn("Item is not a valid file or directory:", item);
      }
    });

    const fileList = await Promise.all(fileListPromises);

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
      <Tooltip content={title} position="bottom">
        <IconButton
          color="#inherit"
          aria-label="controls"
          size="small"
          onClick={() => {
            updateIsDropFileSystem(false);
            setDialogOpen(true);
          }}
        >
          <ArIcon name={"UploadFile"} className="text-black w-6 h-6" />
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
