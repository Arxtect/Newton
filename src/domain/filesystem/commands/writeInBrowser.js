/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import fs from "fs";
import path from "path";
import pify from "pify";
import { ensureDir } from "./ensureDir";

// 将 fs 的方法转换为返回 Promise 的方法
const writeFile = pify(fs.writeFile);

// 处理二进制文件上传
export const writeInBrowser = async (file, dirpath, reload) => {
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
    return browserPath;
  } catch (error) {
    console.error(`failed to upload ${file.name}:`, error);
  }
};
