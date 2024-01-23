import fs from "fs";
import flatten from "lodash/flatten";
import path from "path";
import pify from "pify";
import { existsPath } from "..";

export async function findRepositoriesWithGit(currentDir = "") {
  if (await existsPath(path.join(currentDir, ".git"))) {
    return [currentDir];
  }
  const paths = await pify(fs.readdir)(currentDir);
  const chunks = await Promise.all(
    paths.map(async (s) => {
      const nextDir = path.join(currentDir, s);
      const stat = await pify(fs.stat)(nextDir);
      if (stat.isDirectory()) {
        return findRepositoriesWithGit(nextDir);
      }
      return [];
    })
  );

  return flatten(chunks);
}
