import * as git from "isomorphic-git";
import fs from "fs";
import pify from "pify";
import { createBranch } from "./createBranch";

// 将 fs 的方法转换为返回 Promise 的方法
const writeFile = pify(fs.writeFile);

export async function setupAndPushToRepo(projectRoot, remoteUrl, options) {
  await git.init({ fs, dir: projectRoot });
  await git.addRemote({
    fs,
    dir: projectRoot,
    remote: "origin",
    url: remoteUrl,
  });

  // 为了简单起见，直接使用文件系统操作来创建一个文件
  await writeFile(`${projectRoot}/README.md`, "# Project Title\n");

  // 将文件添加到Git跟踪
  await git.add({ fs, dir: projectRoot, filepath: "README.md" });

  // 进行首次提交
  await git.commit({
    fs,
    dir: projectRoot,
    author: {
      name: "username",
      email: "username@example.com",
    },
    message: "Initial commit",
  });
  await createBranch(projectRoot, "main");

  try {
    await git.push({
      fs,
      dir: projectRoot,
      remote: "origin",
      ref: "main",
      ...options,
    });
  } catch (e) {
    console.log(e.message);
    if (e.message.includes("force:true")) {
      throw new Error("Repository is not empty, please try clone.");
    }
  }

  console.log("Repository setup complete and pushed to remote.");
}
