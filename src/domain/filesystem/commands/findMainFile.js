import fs from "fs";
import path from "path";
import { readFile } from "../queries/readFile";
/**
 * 识别主文件
 * @param {string[]} fileList - 文件路径列表
 * @param {string} projectDir - 项目目录路径
 * @returns {string|null} 主文件路径或null
 */
async function findMainFile(fileList) {
  // 过滤出所有的 .tex 文件
  const texFiles = fileList.filter((file) => path.extname(file) === ".tex");

  // 检查每个 .tex 文件的内容
  let mainFile = null;
  const successfullyReadFiles = []; // 用于记录成功读取的文件

  for (const filePath of texFiles) {
    const content = await readFile(filePath).catch((err) => {
      console.error(`Error reading file ${filePath}:`, err);
      return null; // 读取失败时返回 null
    });

    if (content) {
      successfullyReadFiles.push(filePath); // 记录成功读取的文件
      const constr = content.toString();

      // 检查文件中的 % !TEX root 注释
      const rootMatch = constr.match(/% !TEX root = (.*\.tex)/);
      if (rootMatch) {
        mainFile = rootMatch[1];
        break;
      }

      // 检查文件中是否包含 \documentclass 命令
      if (
        constr
          .split("\n")
          .some((line) => line.trimStart().startsWith("\\documentclass["))
      ) {
        mainFile = filePath;
        break;
      }
    }
  }

  // 如果没有找到 % !TEX root 注释和 \documentclass 命令，则默认使用第一个成功读取的 .tex 文件
  if (texFiles.length > 0 && !mainFile) {
    mainFile =
      successfullyReadFiles.find(
        (file) => path.basename(file) === "main.tex"
      ) || successfullyReadFiles[0];
  }

  return mainFile;
}

export { findMainFile };
