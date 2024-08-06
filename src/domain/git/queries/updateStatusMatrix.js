/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import * as git from "isomorphic-git";
import fs from "fs";
import { statusMatrix } from "../commands/statusMatrix";

export async function updateStatusMatrix(projectRoot, matrix, patterns) {
  // return getStagingStatus(projectRoot)
  if (patterns.length === 0) {
    return statusMatrix({ fs,dir: projectRoot });
  }

  const buffer = [...matrix];
  for (const pattern of patterns) {
    const newMat = await statusMatrix({
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
