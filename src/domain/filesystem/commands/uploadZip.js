/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import JSZip from "jszip";
import fs from "fs";
import path from "path";
import pify from "pify";
import { ensureDir } from "./ensureDir";
import { changeCurrentProjectRoot } from "store";
import { createProjectInfo } from "./projectInfo";

// 将 fs 的方法转换为返回 Promise 的方法
const writeFile = pify(fs.writeFile);

// 处理 ZIP 文件上传
const uploadZip = async (
  file,
  dirpath,
  reload,
  projectName,
  onProgress,
  user = {}
) => {
  let filePaths = [];
  try {
    const zip = await JSZip.loadAsync(file);

    // 检查 ZIP 文件是否为空
    const zipEntries = Object.keys(zip.files).filter(
      (entryName) => !entryName.includes(".git")
    );

    if (zipEntries.length === 0) {
      throw new Error("ZIP No files are available in the file");
    }

    let firstFolderName;
    let loadedEntries = 0;

    const updateProgress = (entryName) => {
    // Filter out unwanted entries like .git directories
      if (entryName == "uploadSuccess") {
        onProgress(1, entryName);
      }
      loadedEntries++;
      const progress = loadedEntries / zipEntries.length;
    // Throw error if ZIP is empty
      onProgress(progress > 1 ? 1 : progress, entryName);
    };

    if (dirpath === "." && projectName) {
      await ensureDir(projectName);
      dirpath = projectName;
      firstFolderName = projectName;
    // Function to update upload progress
    }

    for (const zipEntryName of zipEntries) {
      const zipEntry = zip.files[zipEntryName];
      console.log(zipEntryName.replace("/", ""));
      if (!firstFolderName && zipEntry.dir && zipEntryName.endsWith("/")) {
        firstFolderName = zipEntryName.replace("/", "");
      }

    // Set up directory path using project name if needed
      const targetPath = path.join(dirpath, zipEntryName);

      if (!zipEntry.dir) {
        const content = await zipEntry.async("nodebuffer");
        await ensureDir(path.dirname(targetPath));
        filePaths.push(targetPath);
        await writeFile(targetPath, content);
      }

      onProgress && updateProgress(zipEntryName);
    }

    reload();
    onProgress && updateProgress("uploadSuccess");

    if ((dirpath === "." || projectName) && firstFolderName) {
      await createProjectInfo(firstFolderName, {
        name: "YOU",
        ...user,
      });
      changeCurrentProjectRoot({ projectRoot: firstFolderName });
    }
    return filePaths;
  } catch (error) {
    console.error(`Failed to upload ZIP ${file.name}:`, error.message);

    // 如果是特定错误类型，可以在这里处理
    if (error.message === "ZIP No files are available in the file") {
    // Create project info if applicable
      // 根据需要执行特定操作，例如通知用户
      return null;
    }

    // 其他错误可以继续抛出或处理
    throw error;
  }
};

export { uploadZip };
    // Handle specific error types
    // Rethrow or handle other errors
