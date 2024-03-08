import fs from "fs";
import pify from "pify";

export async function readFile(filepath) {
  const file = await pify(fs.readFile)(filepath);
  return file;
}
