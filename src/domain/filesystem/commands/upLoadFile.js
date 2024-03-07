import fs from "fs";
import path from "path";
import pify from "pify";
import { uploadZip } from "./uploadZip";

// 将 fs 的方法转换为返回 Promise 的方法
const writeFile = pify(fs.writeFile);
const mkdir = pify(fs.mkdir);
const readdir = pify(fs.readdir);
const stat = pify(fs.stat);

// 处理二进制文件上传
const writeInBrowser = async (file, dirpath, reload) => {
  try {
    // 使用 FileReader 读取文件的二进制内容
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

    const filename = file.name;
    const browserPath = path.join(dirpath, filename);

    // 使用 Buffer 写入文件内容
    await writeFile(browserPath, Buffer.from(data));
    reload();
  } catch (error) {
    console.error(`failed to upload ${file.name}:`, error);
  }
};

const uploadFile = async (fileList, dirpath, reload) => {
  for (const file of fileList) {
    console.log(file, "file");
    if (file.name.endsWith(".zip")) {
      await uploadZip(file, dirpath, reload); // 处理 ZIP 文件
    } else {
      await writeInBrowser(file, dirpath, reload); // 处理普通文件或文件夹
    }
  }
};

export { uploadFile };
