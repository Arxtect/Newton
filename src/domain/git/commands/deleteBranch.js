import fs from "fs";
import * as git from "isomorphic-git";

export async function deleteBranch(projectRoot, branchName) {
  return git.deleteBranch({ dir: projectRoot, ref: branchName });
}
