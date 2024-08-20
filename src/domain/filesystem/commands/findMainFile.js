import fs from "fs";
import path from "path";
import { readFile } from "../queries/readFile";
/**
 * 识别主文件
 * @param {string[]} fileList - 文件路径列表
 * @param {string} projectDir - 项目目录路径
 * @returns {string|null} 主文件路径或null
 */
async function  findMainFile(fileList) {
  // 过滤出所有的 .tex 文件
  const texFiles = fileList.filter((file) => path.extname(file) === ".tex");

  console.log(texFiles, "filePath");
  // 检查每个 .tex 文件的内容
  let mainFile = null;
  for (const filePath of texFiles) {
    const content = await readFile(filePath);

    // 检查文件中的 % !TEX root 注释
    const rootMatch = content.toString().match(/% !TEX root = (.*\.tex)/);
    if (rootMatch) {
      mainFile = rootMatch[1];
      break;
    }

    // 检查文件中是否包含 \documentclass 命令
    if (content.includes("\\documentclass")) {
      mainFile = filePath;
      break;
    }
  }

  // 如果没有找到 % !TEX root 注释和 \documentclass 命令，则默认使用第一个 .tex 文件
  if (!mainFile && texFiles.length > 0) {
    mainFile = texFiles[0];
  }

  return mainFile;
}

export { findMainFile };