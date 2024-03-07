import * as git from "isomorphic-git";

export async function getHistory(projectRoot, { depth, ref = "master" }) {
  return git.log({ dir: projectRoot, depth, ref });
}
