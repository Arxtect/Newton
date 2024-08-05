import * as git from "isomorphic-git";
import fs from "fs";

export async function createBranch(projectRoot, newBranchName) {
  return git.branch({ fs,dir: projectRoot, ref: newBranchName });
}
