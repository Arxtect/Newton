import fs from 'fs';
import path from 'path';
import pify from 'pify';
import {mkdir} from "./mkdir"
// 递归创建目录
export const ensureDir = async (dirpath) => {
  const parentDir = path.dirname(dirpath);

  if (parentDir !== dirpath && parentDir !== ".") {
      console.log(parentDir, dirpath, 'parentDir');
    await ensureDir(parentDir);
  }
  try {
    await mkdir(dirpath);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
};