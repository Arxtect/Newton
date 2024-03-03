import * as git from "isomorphic-git";
import fs from "fs";

export async function fetchLatestRemoteInfo({ dir, remote, corsProxy, token }) {
  await git.fetch({
    fs,
    dir,
    remote,
    corsProxy,
    singleBranch: false,
    token,
  });
}
export async function hasLocalCommits({
  projectRoot,
  branch,
  remote = "origin",
  remoteBranch,
}) {
  // 获取本地分支的最新提交
  const localCommits = await git.log({
    fs,
    dir: projectRoot,
    ref: branch,
  });

  // 如果本地没有提交，可以早点返回
  if (localCommits.length === 0) {
    return false; // 没有本地提交
  }

  try {
    // 尝试获取远程分支的最新提交
    const remoteCommits = await git.log({
      fs,
      dir: projectRoot,
      ref: `refs/remotes/${remote}/${remoteBranch || branch}`,
    });

    // 比较本地和远程的最新提交
    return localCommits[0].oid !== remoteCommits[0].oid;
  } catch (error) {
    // 处理远程分支不存在的情况
    console.error("Error fetching remote commits:", error.message);
    // 远程分支不存在，假设所有本地提交都是未推送的
    return true;
  }
}

export async function isCanPush({
  projectRoot,
  remote,
  ref,
  token,
  corsProxy,
}) {
  await fetchLatestRemoteInfo({ dir: projectRoot, remote, corsProxy, token });
  const hasCommits = await hasLocalCommits({
    projectRoot,
    branch: ref,
    remote,
  });
  console.log(hasCommits, "hasCommits");
  if (!hasCommits) {
    console.log("No local commits to push.");
    return false;
  }
  return !!hasCommits
}
