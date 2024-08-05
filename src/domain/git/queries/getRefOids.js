import * as git from "isomorphic-git"
import flatten from "lodash/flatten"
import path from "path"
import fs from "fs";
export async function getRefOids(projectRoot, ref) {
  const sha = await git.resolveRef({fs, dir: projectRoot, ref })
  return getCommitOids(projectRoot, sha)
}

export async function getCommitOids(projectRoot, oid) {
  const { object: commit } = await git.readObject({ fs,dir: projectRoot, oid })
  return await searchTree(projectRoot, commit.tree)
}

export async function searchTree(
  projectRoot,
  oid
) {
  const files = await _searchTree({ dir: projectRoot, oid, prefix: "" })
  return files.sort((a, b) => (a.filepath < b.filepath ? -1 : 1))
}

async function _searchTree({
  dir,
  oid,
  prefix
}: {
  dir
  oid
  prefix
}) {
  const { object: tree } = await git.readObject({ fs,dir, oid })
  const files = await Promise.all(
    tree.entries.map(async (entry) => {
      if (entry.type === "blob") {
        return [
          {
            oid: entry.oid,
            filepath: path.join(prefix, entry.path)
          }
        ]
      } else if (entry.type === "tree") {
        return _searchTree({
          dir,
          oid: entry.oid,
          prefix: path.join(prefix, entry.path)
        })
      }
    })
  )
  return flatten(files)
}
