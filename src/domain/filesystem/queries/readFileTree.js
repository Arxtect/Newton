import fs from "fs";
import path from "path";
import pify from "pify";
import orderBy from "lodash/orderBy";
import { projectInfoExists } from "../commands/projectInfo";
import { IGNORE_PATTERNS } from "./getFileRecursively";

const readdir = pify(fs.readdir);
const stat = pify(fs.stat);

export async function readFileTree(
  dirpath,
  parentName = path.basename(dirpath),
  isNotSync = true,
  depth = 1
) {
  const filenames = await readdir(dirpath);

  const ret = await Promise.all(
    filenames.map(async (name) => {
      if (!!projectInfoExists(name) && isNotSync) return null;
      const childPath = path.join(dirpath, name);
      if (IGNORE_PATTERNS.includes(childPath)) {
        return null;
      }
      const stats = await stat(childPath);

      if (stats.isDirectory()) {
        // Recursively get children for directories
        const children = await readFileTree(
          childPath,
          path.basename(dirpath),
          isNotSync,
          depth + 1
        );
        return {
          name,
          type: "dir",
          parentName,
          filepath: childPath,
          depth,
          children,
        };
      } else {
        return {
          name,
          type: "file",
          parentName,
          filepath: childPath,
          depth,
        };
      }
    })
  );

  return orderBy(
    ret.filter((x) => x !== null),
    [(s) => s.type + "" + s.name]
  );
}
