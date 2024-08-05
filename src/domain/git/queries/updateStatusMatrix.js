import * as git from "isomorphic-git";
import fs from "fs";
export async function updateStatusMatrix(projectRoot, matrix, patterns) {
  // return getStagingStatus(projectRoot)
  if (patterns.length === 0) {
    return git.statusMatrix({ fs,dir: projectRoot });
  }

  const buffer = [...matrix];
  for (const pattern of patterns) {
    const newMat = await git.statusMatrix({
      fs,
      dir: projectRoot,
      pattern,
    });

    for (const newRow of newMat) {
      const [fpath] = newRow;
      const bufferIndex = buffer.findIndex(([f]) => {
        return f === fpath;
      });

      if (bufferIndex > -1) {
        buffer[bufferIndex] = newRow;
      } else {
        buffer.push(newRow);
      }
    }
  }

  return buffer;
}
