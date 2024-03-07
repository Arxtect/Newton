/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-02-26 20:29:27
 */
import fs from "fs";
import path from "path";
import pify from "pify";

export async function findAllProject(currentDir = ".") {
  try {
    // 读取当前目录下的所有条目（文件和文件夹）
    const entries = await pify(fs.readdir)(currentDir);
    // 使用Promise.all来并行处理所有条目
    const dirPromises = entries.map(async (entry) => {
      const entryPath = path.join(currentDir, entry);
      const stat = await pify(fs.stat)(entryPath);
      console.log(stat);
      // 如果条目是一个目录，返回其名称，否则返回null
      return stat.isDirectory() ? entry : null;
    });
    // 解析所有promises，过滤掉null值，只保留目录名称
    const dirs = await Promise.all(dirPromises);
    return dirs.filter((dir) => dir !== null);
  } catch (error) {
    // 在这里处理错误，例如打印到控制台或者抛出异常
    console.error(error);
    throw error; // 或者你可以决定返回一个空数组，取决于你的错误处理策略
  }
}

export async function findAllProjectInfo(currentDir = ".") {
  try {
    // 读取当前目录下的所有条目（文件和文件夹）
    const entries = await pify(fs.readdir)(currentDir);
    // 使用Promise.all来并行处理所有条目
    const dirPromises = entries.map(async (entry, index) => {
      const entryPath = path.join(currentDir, entry);
      const stat = await pify(fs.stat)(entryPath);
      console.log(stat);
      // 如果条目是一个目录，返回其名称，否则返回null
      return {
        ...stat,
        title: stat.isDirectory() ? entry : null,
        owner: "You",
        lastModified: stat?.mtime,
      };
    });
    // 解析所有promises，过滤掉null值，只保留目录名称
    const dirs = await Promise.all(dirPromises);
    return dirs.filter((dir) => dir.title !== null);
  } catch (error) {
    // 在这里处理错误，例如打印到控制台或者抛出异常
    console.error(error);
    throw error; // 或者你可以决定返回一个空数组，取决于你的错误处理策略
  }
}
