import * as git from "isomorphic-git";
import fs from "fs";
import pify from "pify";
import path from "path";
import { createBranch } from "./createBranch";
import { checkoutBranch } from "./checkoutBranch";

const fsPify = {
  mkdir: pify(fs.mkdir),
  readdir: pify(fs.readdir),
  stat: pify(fs.stat),
};

// 将 fs 的方法转换为返回 Promise 的方法
const writeFile = pify(fs.writeFile);

export async function addAllFilesToGit(dir) {
  async function addFilesFromDirectory(currentPath) {
    const entries = await fsPify.readdir(currentPath);

    for (const entry of entries) {
      // Skip the .git directory
      if (entry === ".git") {
        continue;
      }

      const entryPath = path.join(currentPath, entry);
      const stat = await fsPify.stat(entryPath);

      if (stat.isFile()) {
        // Assuming `dir` is the root of your project and also the root where the git repo is initialized
        const gitPath = path.relative(dir, entryPath);
        await git.add({ fs, dir, filepath: gitPath });
        console.log(`Added ${gitPath}`);
      } else if (stat.isDirectory()) {
        await addFilesFromDirectory(entryPath); // Recurse into subdirectories
      }
    }
  }

  await addFilesFromDirectory(dir);
}

export async function setupAndPushToRepo(projectRoot, remoteUrl, options) {


  try {
    await git.init({ fs, dir: projectRoot });
    await git.addRemote({
      fs,
      dir: projectRoot,
      remote: "origin",
      url: remoteUrl,
    });

    // 为了简单起见，直接使用文件系统操作来创建一个文件
    // await writeFile(`${projectRoot}/main.tex`, "\\documentclass{article}\n");

    // 将文件添加到Git跟踪
    await addAllFilesToGit(projectRoot);

    // 进行首次提交
    await git.commit({
      fs,
      dir: projectRoot,
      author: {
        name: options.committerName,
        email: options.committerEmail,
      },
      message: "arxtect initial commit",
    });

    await createBranch(projectRoot, "main");
    await checkoutBranch(projectRoot, "main");
    await git.push({
      fs,
      dir: projectRoot,
      remote: "origin",
      ref: "main",
      ...options,
    });
  } catch (e) {
    console.log(e.message);
    if (e.message.includes("force: true")) {
      throw new Error("Repository is not empty, please try clone.");
    }
  }

  console.log("Repository setup complete and pushed to remote.");
}
