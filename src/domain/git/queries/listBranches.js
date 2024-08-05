import * as git from "isomorphic-git";
import fs from "fs";
export function listBranches(projectRoot, remote = null) {
  return git.listBranches({ fs,dir: projectRoot, remote });
}

export async function listRemoteBranches(projectRoot, remote) {
  try {
    const branches = await git.listBranches({
      fs,
      dir: projectRoot,
      remote,
    });
    return branches.map((b) => `remotes/${remote}/${b}`);
  } catch (e) {
    // TODO: Check remote fetched once
    return [];
  }
}
