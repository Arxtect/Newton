/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-01 10:09:26
 */
import fs from "fs";
import path from "path";
import pify from "pify";
import http from "isomorphic-git/http/web";

import {
  cloneRepository,
  setupAndPushToRepo,
  getRemotesUrl,
  commitAll,
  pushBranch,
  getBranchStatus,
} from "domain/git";

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
  // try {
  //   await pify(fs.mkdir)(path.join("/", user));
  // } catch (e) {
  //   console.log(path.join("/", user), "exists");
  //   // Exists
  // }
  const destPath = path.join("/", repo);
  console.log(destPath, "destPath");

  await cloneRepository(destPath, clonePath, {
    singleBranch: true,
    corsProxy: "https://cors.isomorphic-git.org",
    token: "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",
  });
};

const gitCloneGitea = async () => {
  const clonePath = "http://localhost:3000/git/devin/test1123.git";
  const match = clonePath.match(/\/([^\/]+)\/([^\/]+)\.git$/);

  if (!match) {
    console.error("Invalid repository URL");
    return;
  }

  const user = match[1];
  const repo = match[2];
  console.log(repo, "repo");
  const destPath = path.join("/", repo);
  console.log(destPath, "destPath");

  await cloneRepository(destPath, clonePath, {
    singleBranch: true,
    token: "1f6678fb4022f33f98dbd06e45d454b659e220e2",
  });
};

const linkRepo = async () => {
  // 使用示例
  const projectRoot = "/arxtect";
  const remoteUrl = "https://github.com/devixyz/test.git";
  setupAndPushToRepo(projectRoot, remoteUrl, {
    corsProxy: "https://cors.isomorphic-git.org",
    token: "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",
  }).catch(console.error);
  const remoteUrls = await getRemotesUrl(projectRoot);
  console.log(remoteUrls, "remoteUrl");
};

const commitFile = async (projectRoot, message) => {
  const author = {
    name: "username",
    email: "username@example.com",
  };
  const result = await commitAll(projectRoot, message, author);
  if (result.code == 200) {
    console.log("commit success", result.status);
  } else {
    console.log(result?.message);
  }
};

const gitPush = async (projectRoot) => {
  const { currentBranch } = await getBranchStatus(projectRoot);
  console.log(currentBranch, "currentBranch");
  try {
    const status = await pushBranch({
      projectRoot,
      remote: "origin",
      ref: currentBranch,
      corsProxy: "https://cors.isomorphic-git.org",
      token: "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",
    });
    console.log(status);
  } catch (e) {
    console.log(e.message);
    if (e.message.includes("force:true")) {
      throw new Error("Repository is not empty, please try clone.");
    }
  }

  console.log("push success, branch main.");
};

export { gitClone, linkRepo, commitFile, gitPush, gitCloneGitea };
