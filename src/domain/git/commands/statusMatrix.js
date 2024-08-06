/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import * as git from "isomorphic-git";
import { getInfoProjectName } from "domain/filesystem";


export async function statusMatrix(options) {
  const statusMatrix = await git.statusMatrix(options);

  // 过滤掉你不希望包含的文件
  const filteredStatusMatrix = statusMatrix.filter(([filepath]) => {
    return filepath !== getInfoProjectName();
  });

  return filteredStatusMatrix;
}
