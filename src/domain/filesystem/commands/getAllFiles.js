import fs from "fs";
import path from "path";
import pify from "pify";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const fsPify = {
  readdir: pify(fs.readdir),
  stat: pify(fs.stat),
  readFile: pify(fs.readFile),
};


export async function readDirectoryTree(rootpath) {
  async function readDirRecursive(currentPath) {
    const entries = await fsPify.readdir(currentPath);
    const entryStats = await Promise.all(
      entries.map((entry) => fsPify.stat(path.join(currentPath, entry)))
    );

    const filesPromises = entryStats.map((stat, index) => {
      if (stat.isFile()) {
        const filePath = path.join(currentPath, entries[index]);
        // 不指定编码，以便得到 Buffer 对象
        return fsPify.readFile(filePath).then((content) => ({
          path: filePath,
          content, // 这里 content 是一个 Buffer
        }));
      }
      return null;
    });

    const dirPromises = entryStats.map((stat, index) => {
      if (stat.isDirectory()) {
        const dirPath = path.join(currentPath, entries[index]);
        return readDirRecursive(dirPath);
      }
      return null;
    });

    return {
      path: currentPath,
      files: (await Promise.all(filesPromises)).filter(Boolean),
      directories: (await Promise.all(dirPromises)).filter(Boolean),
    };
  }

  return readDirRecursive(rootpath);
}
function addFilesToZip(dir, zipFolder, parentDir = "", rootpath = "", isMulti = false) {
  dir.files.forEach((file) => {
    if (isMulti) {
      const relativeFilePath = path.basename(file.path)
      zipFolder.file(relativeFilePath, file.content);
    } else {
      zipFolder.file(path.basename(file.path), file.content);
    }
  });

  dir.directories.forEach((subDir) => {
    // 计算子目录相对于 rootpath 的相对路径
    const relativeDirPath = path.relative(rootpath, subDir.path);
    // 计算子目录相对于 parentDir 的相对路径
    const zipDirPath = parentDir
      ? path.relative(parentDir, relativeDirPath)
      : relativeDirPath;
    const subFolder = zipFolder.folder(zipDirPath);
    addFilesToZip(subDir, subFolder, relativeDirPath, rootpath, isMulti); // 递归调用时更新 
  });
}
export async function downloadDirectoryAsZip(rootpath) {
  const directoryTree = await readDirectoryTree(rootpath);
  console.log(directoryTree, "directoryTree");
  const zip = new JSZip();

  addFilesToZip(directoryTree, zip, "", rootpath);

  zip.generateAsync({ type: "blob" }).then(function (blob) {
    saveAs(blob, `${rootpath}.zip`);
  });
}

export const getRandomString = () => {
  const randomPart = Math.random().toString(36).substring(2, 15);
  const timestamp = new Date().getTime();
  const randomName = `${timestamp}-${randomPart}`;
  return randomName
}

export async function downloadMultiDirectoryAsZip(rootpathList) {
  const zip = new JSZip();

  for (let rootpath of rootpathList) {
    const directoryTree = await readDirectoryTree(rootpath);
    const zipFolder = zip.folder(rootpath)
    console.log(directoryTree, rootpathList, 'directoryTree')
    addFilesToZip(directoryTree, zipFolder, "", rootpath, true);
  }


  zip.generateAsync({ type: "blob" }).then(function (blob) {
    saveAs(blob, `${getRandomString()}.zip`);
  });
}

export async function saveZipToBlob(rootpath) {
  const directoryTree = await readDirectoryTree(rootpath);
  const zip = new JSZip();
  addFilesToZip(directoryTree, zip, "", rootpath);
  const blob = await zip.generateAsync({ type: "blob" });

  console.log(blob.type, " blob.type");
  // 将 Blob 转换成 File
  const file = new File([blob], `${rootpath.split("/").pop()}.zip`, {
    type: blob.type,
  });
  return file;
}

export async function getAllFileNames(rootpath) {
  async function getAllFileNamesRecursive(currentPath) {
    const entries = await fsPify.readdir(currentPath);
    let files = [];

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry);
      const entryStat = await fsPify.stat(fullPath);

      if (entryStat.isFile()) {
        files.push(fullPath); // If it's a file, push the full path
      } else if (entryStat.isDirectory()) {
        const subdirectoryFiles = await getAllFileNamesRecursive(fullPath); // If it's a directory, recurse
        files = files.concat(subdirectoryFiles); // Concatenate the results
      }
    }

    return files;
  }

  return getAllFileNamesRecursive(rootpath);
}
