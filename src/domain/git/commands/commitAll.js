import * as git from "isomorphic-git";
import * as Parser from "../queries/parseStatusMatrix";
import { gitCommandSuccess, gitCommandError } from "@/util";

export async function commitAll(root, message, author) {
  const mat = await git.statusMatrix({ dir: root });
  const modified = Parser.getModifiedFilenames(mat);
  const removable = Parser.getRemovableFilenames(mat);

  if (modified.length === 0 && removable.length === 0) {
    return gitCommandError("No changes to commit");
  }
  console.log(modified, removable, "removable");

  for (const filepath of modified) {
    if (removable.includes(filepath)) {
      await git.remove({ dir: root, filepath });
    } else {
      // TODO: Why?????
      if (filepath) {
        await git.add({ dir: root, filepath });
      }
    }
  }

  const status = await git.commit({
    dir: root,
    message,
    author,
  });
  return gitCommandSuccess(status);
}
