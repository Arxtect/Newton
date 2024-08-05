/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 13:51:21
 */
import * as git from "isomorphic-git";
import path from "path";
import { mkdir, writeFile } from "domain/filesystem";
import fs from "fs";


export async function createProject(newProjectRoot) {
  await mkdir(newProjectRoot);
  await git.init({ fsmdir: newProjectRoot });
  const outpath = path.join(newProjectRoot, "README.md");
  await writeFile(outpath, "# New Project");
  await git.add({ fs,dir: newProjectRoot, filepath: "README.md" });
  await git.commit({
    fs,
    dir: newProjectRoot,
    author: { name: "system", email: "dummy" },
    message: "Init",
  });
}
