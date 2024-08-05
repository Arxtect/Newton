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
    await git.init({ fs, dir: projectRoot, defaultBranch: 'main' });
    await git.addRemote({
      fs,
      dir: projectRoot,
      remote: "origin",
      url: remoteUrl,
    });

    await addAllFilesToGit(projectRoot);

    await git.commit({
      fs,
      dir: projectRoot,
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