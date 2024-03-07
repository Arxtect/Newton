import fs from "fs";
import path from "path";
import pify from "pify";

export async function readDirectories(rootpath) {
  const filenames = await pify(fs.readdir)(rootpath);

  const ret = await Promise.all(
    filenames.map(async (name) => {
      const pathname = path.join(rootpath, name);
      const stat = await pify(fs.stat)(pathname);
      return {
        pathname,
        type: stat.isDirectory() ? "dir" : "file",
      };
    })
  );
  return ret.filter((r) => r.type === "dir").map((r) => r.pathname);
}
