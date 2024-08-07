import fs from "fs";
import flatten from "lodash/flatten";
import path from "path";
import pify from "pify";

export async function getFilesRecursively(rootPath) {
  const node = await readRecursiveFileNode(rootPath);
  return nodeToFileList(node);
}

export const IGNORE_PATTERNS = [".git"];

export async function readRecursiveFileNode(pathname) {
  const stat = await pify(fs.stat)(pathname);
  if (stat.isDirectory()) {
    const pathList = await pify(fs.readdir)(pathname);
    const children = await Promise.all(
      pathList
        .filter((childPath) => !IGNORE_PATTERNS.includes(childPath))
        .map((childPath) =>
          readRecursiveFileNode(path.join(pathname, childPath))
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

function nodeToFileList(node) {
  if (node.type === "file") {
    return [node.pathname];
  } else if (node.type === "dir") {
    const ret = node.children.map((childNode) => {
      return nodeToFileList(childNode);
    });
    return flatten(ret);
  } else {
    return [];
  }
}
