import fs from "fs";
import pify from "pify";
export async function unlink(aPath) {
  await pify(fs.unlink)(aPath);
}
