/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-02 14:23:15
 */
import * as git from "isomorphic-git";
import fs from "fs";
import { isCanPush } from "domain/git";

export async function pushBranch({
  projectRoot,
  remote,
  ref,
  token,
  corsProxy,
}) {
  const hasCommits = await isCanPush({
    projectRoot,
    ref,
    remote,
    corsProxy,
    token,
  });

  if (!hasCommits) {
    console.log("No local commits to push.");
    return false;
  }
  const ret = await git.push({
    dir: projectRoot,
    remote,
    ref,
    corsProxy,
    token,
  });

  if (ret.errors && ret.errors.length > 0) {
    console.log(ret.errors);
    throw new Error(ret.errors.join("|"));
  }
  return !!ret.ok;
}
