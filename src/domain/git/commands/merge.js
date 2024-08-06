/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import * as git from "isomorphic-git";

export async function merge(options) {
  await git.merge(options);
}
