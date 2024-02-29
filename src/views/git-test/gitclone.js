/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-02-29 17:53:21
 */
import fs from "fs";
import path from "path";
import pify from "pify";
import { cloneRepository, setupAndPushToRepo, getRemotes } from "domain/git";

const gitClone = async () => {
  const clonePath = "https://github.com/devixyz/wasm-git-demo.git";
  const match = clonePath.match(/github\.com\/(.+?)\/(.+?)\.git$/);
  if (!match) {
    console.error("Invalid repository URL");
    return;
  }

  const user = match[1];
  const repo = match[2];

  console.log("git clone");
  try {
    await pify(fs.mkdir)(path.join("/", user));
  } catch (e) {
    console.log(path.join("/", user), "exists");
    // Exists
  }
  const destPath = path.join("/", user, repo);
  console.log(destPath, "destPath");

  await cloneRepository(destPath, clonePath, {
    singleBranch: true,
    corsProxy: "https://cors.isomorphic-git.org",
    token: "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",
  });
};

const linkRepo = async () => {
  // 使用示例
  const projectRoot = "/test";
  const remoteUrl = "https://github.com/devixyz/test.git";
  setupAndPushToRepo(projectRoot, remoteUrl, {
    corsProxy: "https://cors.isomorphic-git.org",
    token: "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",
  }).catch(console.error);
  const remoteUrls = await getRemotes(projectRoot);
  console.log(remoteUrls, "remoteUrl");
};

export { gitClone, linkRepo };
