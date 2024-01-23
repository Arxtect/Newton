import * as git from "isomorphic-git";
export function commitChanges(
  projectRoot,
  message = "Update",
  author = { name: "", email: "" }
) {
  return git.commit({
    author,
    dir: projectRoot,
    message,
  });
}
