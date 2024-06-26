/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 13:51:21
 */
// import fs from "fs";
// import * as git from "isomorphic-git";
// import orderBy from "lodash/orderBy";
// import path from "path";
// import pify from "pify";

// export async function readFileStats(projectRoot, dirpath) {
//   const filenames = await pify(fs.readdir)(dirpath);

//   const relpath = path.relative(projectRoot, dirpath);

//   const mat = await git.statusMatrix({
//     dir: projectRoot,
//     pattern: relpath.length > 0 ? path.join(relpath, "*") : "*",
//   });

//   const indexedFiles = mat.map((x) => path.join(dirpath, x[0]));

//   const ret = await Promise.all(
//     filenames.map(async (name) => {
//       const childPath = path.join(dirpath, name);
//       const stat = await pify(fs.stat)(childPath);

//       return {
//         name,
//         type: stat.isDirectory() ? "dir" : "file",
//         ignored: !indexedFiles.includes(childPath),
//       };
//     })
//   );
//   return orderBy(ret, [(s) => s.type + "" + s.name]);
// }

import fs from "fs";
import path from "path";
import pify from "pify";
import orderBy from "lodash/orderBy";
import { projectInfoExists } from "../commands/projectInfo";

export async function readFileStats(dirpath, isNotSync = true) {
  const readdir = pify(fs.readdir);
  const stat = pify(fs.stat);

  const filenames = await readdir(dirpath);
  console.log(filenames, "filenames");

  const ret = await Promise.all(
    filenames.map(async (name) => {
      if (!!projectInfoExists(name) && isNotSync) return null; // TODO: remove
      const childPath = path.join(dirpath, name);
      const stats = await stat(childPath);

      return {
        name,
        type: stats.isDirectory() ? "dir" : "file",
      };
    })
  );

  return orderBy(
    ret.filter((x) => x !== null),
    [(s) => s.type + "" + s.name]
  );
}
