/*
 * @Description:
 * @Author: Devin
 * @Date: 2025-01-02 11:42:20
 */
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
  parentDir = ".",
  depth = 1
) {
  const filenames = await readdir(dirpath);

  const ret = await Promise.all(
    filenames.map(async (name) => {
      if (name === ".git") return null;

      // if (!!projectInfoExists(name) && isNotSync) return null; // TODO: read project info file
      const childPath = path.join(dirpath, name);
      if (IGNORE_PATTERNS.includes(childPath)) {
        return null;
      }
      const stats = await stat(childPath);

      const mtime = stats.mtime.getTime(); // 转为时间戳

      const relativePath = path.relative(parentDir, childPath); // Calculate relative path
      if (stats.isDirectory()) {
        // Recursively get children for directories
        const children = await readFileTree(
          childPath,
          isNotSync,
          parentDir,
          depth + 1
        );
        return {
          name,
          type: "dir",
          parentDir,
          filepath: relativePath, // Use relative path
          depth,
          mtime, // Include mtime as timestamp
          children,
        };
      } else {
        return {
          name,
          type: "file",
          parentDir,
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
