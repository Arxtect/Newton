import React, { useState, useCallback } from "react";
import { uploadFile, readFile } from "@/domain/filesystem";

function FolderDropZone({ dirpath, children, updateIsDropFileSystem, projectSync, reload }) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    updateIsDropFileSystem(false);
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const getFileWithRelativePath = (fileEntry) => {
    return new Promise((resolve) => {
      fileEntry.file((file) => {
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
    if (!dirpath) {
      return;
    }
    const currentPath = dirpath;
    const fileList = files;
    const filesArray = Array.from(fileList);
    const filePaths = await uploadFile(filesArray, currentPath, reload);
    if (projectSync) {
      for (const filePath of filePaths) {
        const content = await readFile(filePath);
        projectSync.syncFileToYMap(filePath, content);
      }
    }
    updateIsDropFileSystem(true);
  };

  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsOver(false);

    const items = event.dataTransfer.items;
    const fileList = [];

    console.log("Items length:", items.length);

    for (let i = 0; i < items.length; i++) {
      const item = items[i].webkitGetAsEntry();
      if (item) {
        console.log("Processing item:", item);
        if (item.isDirectory) {
          await readDirectory(item, fileList);
        } else if (item.isFile) {
          fileList.push(await getFileWithRelativePath(item));
        }
      }
    }

    console.log("Final fileList:", fileList);
    handleUpload(fileList);

  }, [handleUpload, updateIsDropFileSystem]);

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

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`p-0 ${isOver ? 'bg-[#eaf6ea]' : ''}`}
    >
      {children}
    </div>
  );
}

export default FolderDropZone;
