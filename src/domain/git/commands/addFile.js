/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-02-29 22:15:26
 */
import * as git from "isomorphic-git"
import fs from "fs";

export function addFile(projectRoot, relpath) {
  return git.add({fs,dir: projectRoot, filepath: relpath })
}
