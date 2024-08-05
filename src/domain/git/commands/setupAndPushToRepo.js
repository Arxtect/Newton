import * as git from "isomorphic-git";
import fs from "fs";
import pify from "pify";
import path from "path";
import { createBranch } from "./createBranch";
import { checkoutBranch } from "./checkoutBranch";
import http from "isomorphic-git/http/web";

const fsPify = {
  mkdir: pify(fs.mkdir),
  readdir: pify(fs.readdir),
  stat: pify(fs.stat),
};

const writeFile = pify(fs.writeFile);

export async function addAllFilesToGit(dir) {
  async function addFilesFromDirectory(currentPath) {
    const entries = await fsPify.readdir(currentPath);

    for (const entry of entries) {
      if (entry === ".git") {
        continue;
      }

      const entryPath = path.join(currentPath, entry);
      const stat = await fsPify.stat(entryPath);

      if (stat.isFile()) {
        const gitPath = path.relative(dir, entryPath);
        await git.add({ fs, dir, filepath: gitPath });
        console.log(`Added ${gitPath}`);
      } else if (stat.isDirectory()) {
        await addFilesFromDirectory(entryPath);
      }
    }
  }

  await addFilesFromDirectory(dir);
}


export async function setupAndPushToRepo(projectRoot, remoteUrl, options) {
  try {
    // 初始化仓库并设置默认分支为 main
    await git.init({ fs, dir: projectRoot, defaultBranch: 'main' });
     // 添加远程仓库
    await git.addRemote({
      fs,
      dir: projectRoot,
      remote: 'origin',
      url: remoteUrl,
    });

    // 添加所有文件到暂存区
    await addAllFilesToGit(projectRoot);
 
    // 提交文件
    await git.commit({
      fs,
       author: {
        name: options?.committerName || "arxtect",
        email: options?.committerEmail || "arxtect@gmail.com",
      },
      dir: projectRoot,
      message: 'arxtect initial commit'
    });

  
    await checkoutBranch(projectRoot, "main")

    console.log("push")

    // 推送到远程仓库
     await git.push({
      fs,
      dir: projectRoot,
      remote: "origin",
      ref: "main",
      http,
      ...options,
    });

    console.log('Repository setup complete and pushed to remote.');
  } catch (e) {
    console.log(e.message);
    if (e.message.includes('force: true')) {
      throw new Error('Repository is not empty, please try clone.');
    }
  }
}