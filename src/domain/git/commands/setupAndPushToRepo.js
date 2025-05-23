/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import * as git from "isomorphic-git";
import fs from "fs";
import pify from "pify";
import path from "path";
import { createBranch } from "./createBranch";
import { checkoutBranch } from "./checkoutBranch";
import http from "isomorphic-git/http/web";
import { gitAuth, getAuthor } from "./gitAuth";
import { getInfoProjectName } from "domain/filesystem";

const fsPify = {
  mkdir: pify(fs.mkdir),
  readdir: pify(fs.readdir),
  stat: pify(fs.stat),
};

export async function addAllFilesToGit(dir) {
  async function addFilesFromDirectory(currentPath) {
    const entries = await fsPify.readdir(currentPath);

    for (const entry of entries) {
      console.log(entries, "entries");
      if (entry === ".git" || getInfoProjectName() === entry) {
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
    await git.init({ fs, dir: projectRoot, defaultBranch: "main" });
    // 添加远程仓库
    await git.addRemote({
      fs,
      dir: projectRoot,
      remote: "origin",
      url: remoteUrl,
    });

    // 添加所有文件到暂存区
    await addAllFilesToGit(projectRoot);

    // 提交文件
    await git.commit({
      fs,
      ...getAuthor({
        name: options?.committerName,
        email: options?.committerEmail,
      }),
      dir: projectRoot,
      message: "arxtect initial commit",
    });

    await checkoutBranch(projectRoot, "main");

    // 推送到远程仓库
    let pushResult = await git.push({
      fs,
      dir: projectRoot,
      remote: "origin",
      ref: "main",
      http,
      ...options,
      ...gitAuth(options.token),
    });
    if (pushResult.ok) {
      console.log(
        "Repository setup complete and pushed to remote.",
        pushResult
      );
      return true;
    } else {
      console.log("Repository push failed", pushResult);
      throw new Error(pushResult.error || "git server error.");
    }
  } catch (e) {
    console.log(e.message);
    if (e.message.includes("force: true")) {
      throw new Error("Repository is not empty, please try clone.");
    }
    throw new Error(e.message);
  }
}
