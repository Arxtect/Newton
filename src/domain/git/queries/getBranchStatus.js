import * as git from "isomorphic-git"
import flatten from "lodash/flatten"
import { getHistory } from "./getHistory"
import { listRemoteBranches } from "./listBranches"

export async function getBranchStatus(
  projectRoot
) {
  const currentBranch = await git.currentBranch({ dir: projectRoot })
  const branches = await git.listBranches({ dir: projectRoot })
  const remotes = (await git.listRemotes({ dir: projectRoot })).map(
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
