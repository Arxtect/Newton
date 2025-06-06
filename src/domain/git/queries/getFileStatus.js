import * as git from "isomorphic-git";
import fs from "fs";
export async function getFileStatus(projectRoot, relpath, ref) {
  try {
    return await git.status({ fs,dir: projectRoot, filepath: relpath, ref });
  } catch (e) {
    return "__error__";
  }
}
