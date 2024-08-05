/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import delay from "delay";
import { EventEmitter } from "events";
import * as git from "isomorphic-git";
import fs from "fs";
//  options = {
//    corsProxy,
//    onProgress,
//    onMessage,
//    depth,
//    singleBranch,
//  };

export async function cloneRepository(projectRoot, cloneDest, options) {
  const emitter = new EventEmitter();

  if (options.onProgress) {
    emitter.on("progress", options.onProgress);
  }
  if (options.onMessage) {
    emitter.on("message", options.onMessage);
  }

  // not async for test
  const clonePromise = git.clone({
    fs,
    dir: projectRoot,
    url: cloneDest, //https://github.com/devixyz/wasm-git-demo.git
    ref: "main",
    emitter,
    ...options,
  });

  while (true) {
    await delay(1000);
    try {
      const list = await git.listFiles({fs, dir: projectRoot });
      const e = await git.status({fs, dir: projectRoot, filepath: list[0] });
      console.log("status correct with", e);
      break;
    } catch (e) {
      console.log("wait...", e.message);
    }
  }

  await clonePromise;
  return clonePromise;
}
