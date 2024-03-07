import fs from "fs";
import pify from "pify";

/* Write content to file */
export async function writeFile(filepath, content) {
  await pify(fs.writeFile)(filepath, content);
}
