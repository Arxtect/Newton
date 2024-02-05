import JSZip from "jszip";
import fs from "fs";
import path from "path";
import pify from "pify";
import { ensureDir } from "./upLoadFolder";
import { changeCurrentProjectRoot } from "store";

// 将 fs 的方法转换为返回 Promise 的方法
const writeFile = pify(fs.writeFile);
const mkdir = pify(fs.mkdir);
const readdir = pify(fs.readdir);
const stat = pify(fs.stat);

// 处理 ZIP 文件上传
const uploadZip = async (file, dirpath, reload, projectName) => {
  try {
    let firstFolderName;
    const zip = await JSZip.loadAsync(file); // 使用 JSZip 加载 ZIP 文件
    const zipEntries = Object.keys(zip.files);
    if (dirpath == "." && projectName) {
      await ensureDir(projectName);
      dirpath = projectName;
      firstFolderName = projectName;
    }

    for (const zipEntryName of zipEntries) {
      const zipEntry = zip.files[zipEntryName];
      console.log(zipEntry);
      if (!firstFolderName && zipEntry.dir && zipEntryName.endsWith("/")) {
        firstFolderName = zipEntryName?.replace("/", ""); // 获取文件夹名称
      }

      // 构建目标路径
      const targetPath = path.join(dirpath, zipEntryName);

      if (zipEntry.dir) {
        // 如果是文件夹，则创建文件夹
        // await ensureDir(targetPath);
      } else {
        // 如果是文件，则读取并写入文件
        const blob = await zipEntry.async("blob");
        const arrayBuffer = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsArrayBuffer(blob);
        });

        // 确保目标文件夹存在
        await ensureDir(path.dirname(targetPath));
        // 写入文件
        await writeFile(targetPath, Buffer.from(arrayBuffer));
      }
    }
    reload();
    console.log(firstFolderName, zipEntries, "zipEntries");

    if ((dirpath == "." || projectName) && firstFolderName) {
      console.log(firstFolderName, "firstFolderName");
      changeCurrentProjectRoot({ projectRoot: firstFolderName });
    }
  } catch (error) {
    console.error(`Failed to upload ZIP ${file.name}:`, error);
  }
};

export { uploadZip };
