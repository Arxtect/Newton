import fs from 'fs';
import path from 'path';
import pify from 'pify';
import {mkdir} from "./mkdir"
// 递归创建目录
export const ensureDir = async (dirpath) => {
  const parentDir = path.dirname(dirpath);

  console.log(parentDir, dirpath, 'parentDir');
  if (parentDir !== dirpath && parentDir !== ".") {
      console.log(parentDir, dirpath, 'parentDir');
    await ensureDir(parentDir);
  }
console.log(parentDir, dirpath, 'parentDir');
  try {
    await mkdir(dirpath);
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
  }
};