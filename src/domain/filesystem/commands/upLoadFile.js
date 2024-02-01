/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-31 17:59:54
 */
import fs from "fs";
import path from "path";
import pify from "pify";

// 将 fs 的方法转换为返回 Promise 的方法
const writeFile = pify(fs.writeFile);
const mkdir = pify(fs.mkdir);
const readdir = pify(fs.readdir);
const stat = pify(fs.stat);

// 上传文件
const writeInBrowser = async (file, dirpath, reload) => {
  try {
    const data = await file.text(); // Read the content of the uploaded file
    const filename = file.name;

    const browserPath = path.join(dirpath, filename);
    await writeFile(browserPath, data);
    reload();
  } catch (error) {
    console.error(`failed to upload ${file.name}:`, error);
  }
};

const uploadFile = async (fileList, dirpath, reload) => {
  for (const file of fileList) {
    await writeInBrowser(file, dirpath, reload);
  }
};

export default uploadFile;
