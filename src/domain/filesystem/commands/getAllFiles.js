import fs from "fs";
import path from "path";
import pify from "pify";
import JSZip from "jszip";
import * as git from "isomorphic-git";
import { saveAs } from "file-saver";
import { projectInfoExists } from "./projectInfo";

const fsPify = {
  readdir: pify(fs.readdir),
  stat: pify(fs.stat),
  readFile: pify(fs.readFile),
  mkdir: pify(fs.mkdir),
  writeFile: pify(fs.writeFile),
};

async function readDirectoryTree(rootpath, parentDir = ".") {
  async function readDirRecursive(currentPath) {
    const entries = await fsPify.readdir(currentPath);
    const filesPromises = [];
    const dirPromises = [];

    for (const index in entries) {
      const entryPath = path.join(currentPath, entries[index]);
      const stat = await fsPify.stat(entryPath);

      if (stat.isFile()) {
        if (!projectInfoExists(entryPath)) {
          filesPromises.push(
            fsPify.readFile(entryPath).then((content) => ({
              path: entryPath,
              content,
            }))
          );
        }
      } else if (stat.isDirectory()) {
        console.log(currentPath, entryPath, entries[index], "stat222");
        dirPromises.push(readDirRecursive(entryPath));
      }
    }

    const files = await Promise.all(filesPromises);
    const directories = await Promise.all(dirPromises);

    return {
      path: currentPath,
      files: files.filter(Boolean),
      directories: directories.filter(Boolean),
    };
  }

  return readDirRecursive(path.join(parentDir, rootpath));
}

export async function writeDirectoryTree(rootpath, tree) {
  async function writeDirRecursive(currentPath, tree) {
    await fsPify.mkdir(currentPath, { recursive: true });

    await Promise.all(
      tree.files.map(async (file) => {
        const filePath = path.join(currentPath, path.basename(file.path));
        await fsPify.writeFile(filePath, file.content);
      })
    );

    await Promise.all(
      tree.directories.map(async (dir) => {
        const dirPath = path.join(currentPath, path.basename(dir.path));
        await writeDirRecursive(dirPath, dir);
      })
    );
  }

  await writeDirRecursive(rootpath, tree);
}

function addFilesToZip(
  dir,
  zipFolder,
  parentDir = "",
  rootpath = "",
  isMulti = false
) {
  dir.files.forEach((file) => {
    if (isMulti) {
      const relativeFilePath = path.basename(file.path);
      zipFolder.file(relativeFilePath, file.content);
    } else {
      zipFolder.file(path.basename(file.path), file.content);
    }
  });

  dir.directories.forEach((subDir) => {
    if (path.basename(subDir.path) === ".git") {
      return; // 过滤掉 .git 文件夹
    }

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

export async function downloadDirectoryAsZip(rootpath, parentDir = ".") {
  const directoryTree = await readDirectoryTree(rootpath, parentDir);
  const zip = new JSZip();

  addFilesToZip(directoryTree, zip, "", path.join(parentDir, rootpath), false);

  zip.generateAsync({ type: "blob" }).then(function (blob) {
    saveAs(blob, `${rootpath}.zip`);
  });
}

export const getRandomString = () => {
  const randomPart = Math.random().toString(36).substring(2, 15);
  const timestamp = new Date().getTime();
  const randomName = `${timestamp}-${randomPart}`;
  return randomName;
};

export async function downloadMultiDirectoryAsZip(rootpathList) {
  const zip = new JSZip();

  for (let rootpath of rootpathList) {
    const directoryTree = await readDirectoryTree(rootpath);
    const zipFolder = zip.folder(rootpath);
    console.log(directoryTree, rootpathList, "directoryTree");
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

// 下载特定版本的项目
export async function downloadSpecificVersion(repoPath, commitSHA) {
  const zip = new JSZip();

  // 获取指定提交的文件树
  const { tree } = await git.readTree({
    fs,
    dir: repoPath,
    oid: commitSHA,
  });

  // 递归函数，用于遍历文件树并添加文件到 ZIP
  async function addToZip(tree, currentPath = "") {
    for (const entry of tree) {
      if (entry.type === "tree") {
        // 如果是目录，递归处理
        const subtree = await git.readTree({
          fs,
          dir: repoPath,
          oid: entry.oid,
        });
        await addToZip(subtree.tree, path.join(currentPath, entry.path));
      } else if (entry.type === "blob") {
        // 如果是文件，读取内容并添加到 ZIP
        const { blob } = await git.readBlob({
          fs,
          dir: repoPath,
          oid: entry.oid,
        });
        zip.file(path.join(currentPath, entry.path), blob);
      }
    }
  }

  // 开始添加文件到 ZIP
  await addToZip(tree);

  // 生成 ZIP 文件
  const zipBlob = await zip.generateAsync({ type: "blob" });

  // 将 ZIP 内容写入文件
  saveAs(zipBlob, `${repoPath}-${commitSHA.slice(0, 7)}.zip`);
}
