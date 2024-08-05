import * as git from "isomorphic-git"
import flatten from "lodash/flatten"
import { getHistory } from "./getHistory"
import { listRemoteBranches } from "./listBranches"
import fs from "fs";

export async function getBranchStatus(
  projectRoot
) {
  const currentBranch = await git.currentBranch({ fs,dir: projectRoot })

   if (!currentBranch) {
    throw new Error('No branch found');
  }

  const branches = await git.listBranches({ fs,dir: projectRoot })
  const remotes = (await git.listRemotes({ fs,dir: projectRoot })).map(
    (a) => a.remote
  )

  const remoteBranches = flatten(
    await Promise.all(
      remotes.map(remote => listRemoteBranches(projectRoot, remote))
    )
  )

  const history = await getHistory(projectRoot, { ref: currentBranch })
  return {
    currentBranch,
    branches,
    remotes,
    remoteBranches,
    history
  }
}
