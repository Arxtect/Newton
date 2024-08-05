import * as git from "isomorphic-git";
import fs from "fs";

export function commitChanges(
  projectRoot,
  message = "Update",
  author = { name: "", email: "" }
) {
  return git.commit({
    fs,
    author,
    dir: projectRoot,
    message,
  });
}
