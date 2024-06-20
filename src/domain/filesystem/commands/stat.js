

import fs from "fs";
import path from "path";
import pify from "pify";

const fsPify = {
  stat: pify(fs.stat),
};

export async function stat(dirpath) {
  return await fsPify.stat(dirpath);
}
