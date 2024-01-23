import * as git from "isomorphic-git"
export async function checkoutBranch(
  projectRoot,
  branchName
) {
  return git.checkout({ dir: projectRoot, ref: branchName })
}
