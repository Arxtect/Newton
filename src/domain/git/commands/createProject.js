/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 13:51:21
 */
import * as git from "isomorphic-git";
import path from "path";
import { mkdir, writeFile } from "domain/filesystem";

export async function createProject(newProjectRoot) {
  await mkdir(newProjectRoot);
  await git.init({ dir: newProjectRoot });
  const outpath = path.join(newProjectRoot, "README.md");
  await writeFile(outpath, "# New Project");
  await git.add({ dir: newProjectRoot, filepath: "README.md" });
  await git.commit({
    dir: newProjectRoot,
    author: { name: "system", email: "dummy" },
    message: "Init",
  });
}
