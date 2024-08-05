import * as git from "isomorphic-git";
import fs from "fs";
export async function removeFromGit(projectRoot, filepath) {
  await git.remove({ fs,dir: projectRoot, filepath });
}
