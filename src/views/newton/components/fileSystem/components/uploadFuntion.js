import { uploadFile, readFile } from "@/domain/filesystem";

const getFileWithRelativePath = (fileEntry) => {
  return new Promise((resolve, reject) => {
    fileEntry.file(
      (file) => {
        const fileWithRelativePath = {
          file,
          webkitRelativePath: fileEntry.fullPath,
        };
        resolve(fileWithRelativePath);
      },
      (error) => {
        reject(error);
      }
    );
  });
};

const handleUpload = async (files, dirpath, projectSync, reload) => {
  if (!dirpath) {
    return;
  }
  const currentPath = dirpath;
  const fileList = files;
  const filesArray = Array.from(fileList);
  console.log(filesArray, "filesArray");
  const filePaths = await uploadFile(filesArray, currentPath, reload);
  if (projectSync) {
    for (const filePath of filePaths) {
      const content = await readFile(filePath);
      projectSync.syncFileToYMap(filePath, content);
    }
  }
};

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

const onExternalDrop = async (items, dirpath, projectSync, reload) => {
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

  handleUpload(fileList, dirpath, projectSync, reload);
};

export default onExternalDrop