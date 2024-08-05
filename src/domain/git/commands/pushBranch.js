/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-02 14:23:15
 */
import * as git from "isomorphic-git";
import { EventEmitter } from "events";
import fs from "fs";
import { isCanPush } from "domain/git";
import http from "isomorphic-git/http/web";

export async function pushBranch({
  projectRoot,
  remote,
  ref,
  token,
  corsProxy,
  ...options
}) {
  const emitter = new EventEmitter();

  if (options.onProgress) {
    emitter.on("progress", options.onProgress);
  }
  if (options.onMessage) {
    emitter.on("message", options.onMessage);
  }

  // const hasCommits = await isCanPush({
  //   projectRoot,
  //   ref,
  //   remote,
  //   corsProxy,
  //   token,
  // });

  // if (!hasCommits) {
  //   console.log("No local commits to push.");
  //   return false;
  // }
  const ret = await git.push({
    fs,
    dir: projectRoot,
    remote,
    ref,
    http,
    corsProxy,
    token,
    emitter,
    ...options,
  });

  if (ret.errors && ret.errors.length > 0) {
    console.log(ret.errors);
    throw new Error(ret.errors.join("|"));
  }
  return !!ret.ok;
}
