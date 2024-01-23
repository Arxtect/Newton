import * as git from "isomorphic-git";

export function listBranches(projectRoot, remote = null) {
  return git.listBranches({ dir: projectRoot, remote });
}

export async function listRemoteBranches(projectRoot, remote) {
  try {
    const branches = await git.listBranches({
      dir: projectRoot,
      remote,
    });
    return branches.map((b) => `remotes/${remote}/${b}`);
  } catch (e) {
    // TODO: Check remote fetched once
    return [];
  }
}
