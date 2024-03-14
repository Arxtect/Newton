/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-02-29 22:15:26
 */
import * as git from "isomorphic-git"

export function addFile(projectRoot, relpath) {
  return git.add({ dir: projectRoot, filepath: relpath })
}
