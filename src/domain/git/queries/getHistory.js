import * as git from "isomorphic-git";
import fs from "fs";
export async function getHistory(projectRoot, { depth, ref = "main" }) {
  return git.log({ fs,dir: projectRoot, depth, ref });
}
