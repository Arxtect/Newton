/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-02-26 20:29:27
 */
import fs from "fs";
import path from "path";
import pify from "pify";
import { getProjectInfo, createProjectInfo } from "../commands/projectInfo";
import { deleteExpiredProject } from "../commands/removeDirectory";

export const ShareProjectStorageName = "shareProjectStorage@~";

export const getShareUserStoragePath = (userId) => {
  return ShareProjectStorageName + userId;
};

export const isShareProjectStorage = (dirName) => {
  return dirName.startsWith(ShareProjectStorageName);
};

export async function findAllProject(currentDir = ".") {
  try {
    // 读取当前目录下的所有条目（文件和文件夹）
    const entries = await pify(fs.readdir)(currentDir);
    // 使用Promise.all来并行处理所有条目
    const dirPromises = entries.map(async (entry) => {
      const entryPath = path.join(currentDir, entry);
      const stat = await pify(fs.stat)(entryPath);

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

async function getLastModified(dir) {
  const entries = await pify(fs.readdir)(dir);
  let lastModified = new Date(0); // 初始化为最早的日期

  // 使用Promise.all来并行处理所有条目
  const filePromises = entries.map(async (entry) => {
    const entryPath = path.join(dir, entry);
    const stat = await pify(fs.stat)(entryPath);

    if (stat.mtime > lastModified) {
      lastModified = stat.mtime;
    }

    if (stat.isDirectory()) {
      const subDirLastModified = await getLastModified(entryPath);
      if (subDirLastModified > lastModified) {
        lastModified = subDirLastModified;
      }
    } else {
      if (stat.mtime > lastModified) {
        lastModified = stat.mtime;
      }
    }
  });

  await Promise.all(filePromises);
  return lastModified;
}

export async function findAllProjectInfo(currentDir = ".") {
  try {
    let project = [];

    async function getAllProject(currentDir) {
      const entries = await pify(fs.readdir)(currentDir);

      const tasks = entries.map(async (entry) => {
        const entryPath = path.join(currentDir, entry);
        const stat = await pify(fs.stat)(entryPath);

        if (!stat.isDirectory()) {
          return;
        }

        let projectInfo = await getProjectInfo(entryPath);

        if (!projectInfo || JSON.stringify(projectInfo) === "{}") {
          await createProjectInfo(entryPath, { name: "YOU" });
          projectInfo = await getProjectInfo(entryPath);
        }

        if (isShareProjectStorage(entry)) {
          return getAllProject(entryPath); // 确保返回 Promise
        }

        let title = entry;
        let isExpired = await deleteExpiredProject(title);
        if (isExpired) {
          return;
        }

        const lastModified = await getLastModified(entryPath);
        project.push({
          ...stat,
          title: title,
          name: "YOU",
          lastModified: lastModified || stat?.mtime,
          parentDir: currentDir,
          ...projectInfo,
        });
      });

      await Promise.all(tasks); // 确保所有任务完成
    }

    await getAllProject(currentDir);

    console.log(project, "dirs");
    return project.filter((dir) => dir != null && dir?.title !== null);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export function removeParentDirPath(filePath, parentDir) {
  // Normalize parentDir
  const normalizedParentDir = path.normalize(parentDir);

  // Log the normalized parentDir
  console.log(`Normalized Parent Dir: ${normalizedParentDir}`);

  // Check if parentDir is "."
  if (normalizedParentDir === path.normalize(".")) {
    return filePath;
  }

  // Normalize file paths
  const normalizedFilePath = path.normalize(filePath);
  const normalizedRootPath = path.normalize(parentDir);

  // Get relative path
  const relativePath = path.relative(normalizedRootPath, normalizedFilePath);

  console.log(
    `Relative Path: ${relativePath}, Root Path: ${normalizedRootPath}, File Path: ${normalizedFilePath}, Parent Dir: ${normalizedParentDir},filePath: ${filePath}`
  );

  return relativePath;
}
