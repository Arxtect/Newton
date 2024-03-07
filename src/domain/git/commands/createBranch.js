import * as git from "isomorphic-git";
export async function createBranch(projectRoot, newBranchName) {
  return git.branch({ dir: projectRoot, ref: newBranchName });
}
