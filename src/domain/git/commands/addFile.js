import * as git from "isomorphic-git"

export function addFile(projectRoot, relpath) {
  return git.add({ dir: projectRoot, filepath: relpath })
}
