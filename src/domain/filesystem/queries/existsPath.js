import fs from "fs";
import pify from "pify";
export async function existsPath(aPath) {
  try {
    // NOTE: fs.access is not supported in browserfs
    await pify(fs.stat)(aPath);
    return true;
  } catch (e) {
    return false;
  }
}
