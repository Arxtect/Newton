import * as git from "isomorphic-git";
import { zipWith } from "lodash";
import { getFileStatus } from "./getFileStatus";

export async function listGitFiles(projectRoot, ref = "HEAD") {
  const files = await git.listFiles({
    dir: projectRoot,
    ref,
  });
  const statusList = await Promise.all(
    files.map((f) => getFileStatus(projectRoot, f))
  );
  return zipWith(files, statusList, (filepath, gitStatus) => ({
    filepath,
    gitStatus,
  }));
}
