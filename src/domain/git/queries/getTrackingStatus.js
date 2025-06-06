import * as git from "isomorphic-git";
import difference from "lodash/difference";
import uniq from "lodash/uniq";
import { getFilesRecursively } from "@/filesystem/queries/getFileRecursively";
import fs from "fs";
export async function getTrackingStatus(projectRoot) {
  const trackedByHead = await git.listFiles({
    fs,
    dir: projectRoot,
    ref: "HEAD",
  });

  const trackedByIndex = await git.listFiles({
    fs,
    dir: projectRoot,
  });

  const tracked = uniq([...trackedByHead, ...trackedByIndex]);

  const files = (await getFilesRecursively(projectRoot)).map((pathname) =>
    pathname.replace(projectRoot + "/", "")
  );

  const untracked = difference(files, tracked);

  return {
    tracked,
    untracked,
  };
}

export async function getUntrackingFiles(projectRoot) {
  const tracked = await git.listFiles({
    fs,
    dir: projectRoot,
    ref: "HEAD",
  });

  const files = (await getFilesRecursively(projectRoot)).map((pathname) =>
    pathname.replace(projectRoot + "/", "")
  );

  return difference(files, tracked);
}
