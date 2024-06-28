
import JSZip from "jszip";
import fs from "fs";
import path from "path";
import pify from "pify";
import { ensureDir } from "./upLoadFolder";
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
  console.log(file, "file");
  try {
    let firstFolderName;
    const zip = await JSZip.loadAsync(file); // 使用 JSZip 加载 ZIP 文件
    const zipEntries = Object.keys(zip.files).filter(
      (entryName) => !entryName.includes(".git")
    ); // 过滤掉 .git 条目
    let loadedEntries = 0; // 已解压的条目数

    // 更新进度的函数
    const updateProgress = (entryName) => {
      if (entryName == "uploadSuccess") {
        onProgress(1, entryName);
      }
      loadedEntries++;
      const progress = loadedEntries / zipEntries.length;
      onProgress(progress > 1 ? 1 : progress, entryName);
    };

    if (dirpath === "." && projectName) {
      await ensureDir(projectName);
      dirpath = projectName;
      firstFolderName = projectName;
    }

    for (const zipEntryName of zipEntries) {
      const zipEntry = zip.files[zipEntryName];
      console.log(zipEntryName.replace("/", ""));
      if (!firstFolderName && zipEntry.dir && zipEntryName.endsWith("/")) {
        firstFolderName = zipEntryName.replace("/", ""); // 获取文件夹名称
      }

      // 构建目标路径
      const targetPath = path.join(dirpath, zipEntryName);

      if (zipEntry.dir) {
        // 如果是文件夹，则创建文件夹
        await ensureDir(targetPath);
      } else {
        // 如果是文件，则读取并写入文件
        const content = await zipEntry.async("nodebuffer");
        // 确保目标文件夹存在
        await ensureDir(path.dirname(targetPath));
        // 写入文件
        await writeFile(targetPath, content);
      }

      // 更新进度
      onProgress && updateProgress(zipEntryName);
    }

    console.log("123");

    reload();
    onProgress && updateProgress("uploadSuccess");
    await createProjectInfo(firstFolderName, {
      name: "YOU",
      ...user,
    });
    if ((dirpath === "." || projectName) && firstFolderName) {
      changeCurrentProjectRoot({ projectRoot: firstFolderName });
    }
  } catch (error) {
    console.error(`Failed to upload ZIP ${file.name}:`, error);
  }
};

export { uploadZip };
