import fs from "fs";
import path from "path";
import pify from "pify";
import { unlink } from "./unlink";

export async function removeDirectory(dirpath) {
  const node = await readRecursiveFileNodeWithGit(dirpath);
  return removeDirectoryRecursively(node);
}

async function readRecursiveFileNodeWithGit(pathname) {
  const stat = await pify(fs.stat)(pathname);
  if (stat.isDirectory()) {
    const pathList = await pify(fs.readdir)(pathname);
    const children = await Promise.all(
      pathList.map((childPath) =>
        readRecursiveFileNodeWithGit(path.join(pathname, childPath))
      )
    );
    return {
      children,
      pathname,
      type: "dir",
    };
  } else {
    return {
      pathname,
      type: "file",
    };
  }
}

async function removeDirectoryRecursively(node) {
  if (node.type === "file") {
    await unlink(node.pathname);
  } else if (node.type === "dir") {
    for (const child of node.children) {
      await removeDirectoryRecursively(child);
    }
    // console.log("rmdir", "rmd")
    await pify(fs.rmdir)(node.pathname);
  }
}
