import fs from "fs";
import pify from "pify";
import { existsPath } from "../queries/existsPath";

export async function mkdir(dirpath) {
  if (await existsPath(dirpath)) {
    // Do nothing
    console.info("mkdir: exists", dirpath);
  } else {
    await pify(fs.mkdir)(dirpath);
    console.info("mkdir: done", dirpath);
  }
}
