/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-07 20:37:01
 */
import fs from "fs";
import path from "path";
import pify from "pify";
import { copyFile } from "./copyFile";

const fsPify = {
  mkdir: pify(fs.mkdir),
  copyFile: copyFile,
  readdir: pify(fs.readdir),
  stat: pify(fs.stat),
};

export async function copyProject(projectRoot, copyProjectRoot) {
  console.log(projectRoot, "projectRoot", copyProjectRoot);
  async function copyDirRecursive(sourcePath, destPath) {
    // 确保目标目录存在
    await fsPify.mkdir(destPath, { recursive: true });
    const entries = await fsPify.readdir(sourcePath);

    for (const entry of entries) {
      const sourceEntryPath = path.join(sourcePath, entry);
      const destEntryPath = path.join(destPath, entry);
      const entryStats = await fsPify.stat(sourceEntryPath);
      console.log(entry, entries, "entryStats");

      if (entryStats.isDirectory()) {
        // 如果是目录，则递归复制
        await copyDirRecursive(sourceEntryPath, destEntryPath);
      } else if (entryStats.isFile()) {
        // 如果是文件，则直接复制
        await fsPify.copyFile(sourceEntryPath, destEntryPath);
      }
    }
  }

  return await copyDirRecursive(projectRoot, copyProjectRoot);
}
