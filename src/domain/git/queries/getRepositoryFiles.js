import * as git from "isomorphic-git";
import uniq from "lodash/uniq";
import { getFilesRecursively } from "domain/filesystem/queries/getFileRecursively";
import fs from "fs";
export async function getRepositoryFiles(projectRoot, ignoreGit = true) {
  const files = await getFilesRecursively(projectRoot);
  const relpaths = files.map((fpath) => fpath.replace(projectRoot + "/", ""));
  const indexes = (
    await git.listFiles({
      fs,
      dir: projectRoot,
      ref: "HEAD",
    })
  ).filter((a) => !a?.startsWith(".."));

  const withGitIndex = uniq(relpaths.concat(indexes));
  withGitIndex.sort();

  if (ignoreGit) {
    return withGitIndex.filter((fpath) => !fpath.startsWith(".git"));
  } else {
    return withGitIndex;
  }
}
