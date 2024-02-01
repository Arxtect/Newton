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
        return fsPify.readFile(filePath, "utf8").then((content) => ({
          path: filePath,
          content,
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


export async function downloadDirectoryAsZip(rootpath) {
  const directoryTree = await readDirectoryTree(rootpath);
  const zip = new JSZip();

  function addFilesToZip(dir, zipFolder) {
    dir.files.forEach(file => {
      zipFolder.file(file.path.replace(rootpath, ''), file.content);
    });

    dir.directories.forEach(subDir => {
      const subFolder = zipFolder.folder(subDir.path.replace(rootpath, ''));
      addFilesToZip(subDir, subFolder);
    });
  }

  addFilesToZip(directoryTree, zip);

  zip.generateAsync({ type: "blob" }).then(function (blob) {
    saveAs(blob, "files.zip");
  });
}