import * as git from "isomorphic-git";

export async function getFileStatus(projectRoot, relpath, ref) {
  try {
    return await git.status({ dir: projectRoot, filepath: relpath, ref });
  } catch (e) {
    return "__error__";
  }
}
