/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import * as git from "isomorphic-git";
import * as Parser from "../queries/parseStatusMatrix";
import { gitCommandSuccess, gitCommandError } from "@/util";
import fs from "fs";
import { getAuthor } from "./gitAuth";
import { getInfoProjectName } from "domain/filesystem";
import { statusMatrix } from "./statusMatrix";

export async function commitAll(root, message, author) {
  const mat = await statusMatrix({ fs, dir: root });
  console.log(mat, "mat");
  const modified = Parser.getModifiedFilenames(mat);
  const removable = Parser.getRemovableFilenames(mat);

  if (modified.length === 0 && removable.length === 0) {
    return gitCommandError("No changes to commit");
  }
  console.log(modified, removable, "removable");

  for (const filepath of modified) {
    console.log(filepath, "filepath");
    if (filepath == getInfoProjectName()) {
      continue
    }
    if (removable.includes(filepath)) {
      await git.remove({fs, dir: root, filepath });
    } else {
      // TODO: Why?????
      if (filepath) {
        await git.add({ fs,dir: root, filepath });
      }
    }
  }
  console.log(author, "author");
  const status = await git.commit({
    fs,
    dir: root,
    message,
    committer: author,
    author,
    ...getAuthor({
      name: author?.name,
      email: author?.email,
    }),
  });
  return gitCommandSuccess(status);
}
