import * as git from "isomorphic-git";
export async function removeFromGit(projectRoot, filepath) {
  await git.remove({ dir: projectRoot, filepath });
}
