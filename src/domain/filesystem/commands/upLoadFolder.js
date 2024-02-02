import fs from "fs";
import path from "path";
import pify from "pify";

// 将 fs 的方法转换为返回 Promise 的方法
const writeFile = pify(fs.writeFile);
const mkdir = pify(fs.mkdir);
const readdir = pify(fs.readdir);
const stat = pify(fs.stat);

// 递归创建目录
const ensureDir = async (dirpath) => {
  const parentDir = path.dirname(dirpath);
  if (parentDir !== dirpath) {
    await ensureDir(parentDir);
  }

  try {
    await mkdir(dirpath);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
  }
};

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

    const filename = file.webkitRelativePath || file.name;
    const browserPath = path.join(dirpath, filename);

    // 确保目录存在
    await ensureDir(path.dirname(browserPath));

    // 使用 Buffer 写入文件内容
    await writeFile(browserPath, Buffer.from(data));
    reload();
  } catch (error) {
    console.error(`failed to upload ${file.name}:`, error);
  }
};

const uploadFolder = async (fileList, dirpath, reload) => {
  for (const file of fileList) {
    await writeInBrowser(file, dirpath, reload);
  }
};

export { uploadFolder };
