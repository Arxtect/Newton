import fs from "fs";
import path from "path";
import pify from "pify";

const mkdir = pify(fs.mkdir);

// 递归创建目录
export const ensureDir = async (dirpath) => {
  const parentDir = path.dirname(dirpath);
  if (parentDir !== dirpath) {
    await ensureDir(parentDir);
  }

  try {
    await mkdir(dirpath);
  } catch (error) {
    if (error.code !== "EEXIST") throw error;
  }
};
