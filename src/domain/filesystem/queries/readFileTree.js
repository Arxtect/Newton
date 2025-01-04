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
  isNotSync = true,
  parentName = path.basename(dirpath),
  depth = 1,
  baseDir = dirpath // Add a baseDir parameter
) {
  const filenames = await readdir(dirpath);

  const ret = await Promise.all(
    filenames.map(async (name) => {
      if (name === ".git") return null;

      if (!!projectInfoExists(name) && isNotSync) return null;
      const childPath = path.join(dirpath, name);
      if (IGNORE_PATTERNS.includes(childPath)) {
        return null;
      }
      const stats = await stat(childPath);
      console.log(stats, "filetree");
      const mtime = stats.mtime.getTime(); // 转为时间戳
      const relativePath = path.relative(baseDir, childPath); // Calculate relative path
      if (stats.isDirectory()) {
        // Recursively get children for directories
        const children = await readFileTree(
          childPath,

          isNotSync,
          path.basename(childPath),
          depth + 1,
          baseDir // Pass baseDir to recursive calls
        );
        return {
          name,
          type: "dir",
          parentName,
          filepath: relativePath, // Use relative path
          depth,
          mtime, // Include mtime as timestamp
          children,
        };
      } else {
        return {
          name,
          type: "file",
          parentName,
          filepath: relativePath, // Use relative path
          depth,
          mtime, // Include mtime as timestamp
        };
      }
    })
  );

  return orderBy(
    ret.filter((x) => x !== null),
    [(s) => s.type + "" + s.name]
  );
}
