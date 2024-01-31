import fs from "fs";
import path from "path";
import pify from "pify";

// 将 fs 的方法转换为返回 Promise 的方法
const writeFile = pify(fs.writeFile);
const mkdir = pify(fs.mkdir);
const readdir = pify(fs.readdir);
const stat = pify(fs.stat);

// 上传文件
const uploadFile = async (filepath, rootpath) => {
  try {
    const data = await pify(fs.readFile)(filepath);
    const browserPath = path.join(rootpath, path.basename(filepath));
    await writeFile(browserPath, data);
    console.log(`文件已上传: ${browserPath}`);
  } catch (error) {
    console.error(`上传文件出错 ${filepath}:`, error);
  }
};

// 上传文件夹
const uploadFolder = async (dirpath, rootpath) => {
  try {
    const files = await readdir(dirpath);
    for (const file of files) {
      const fullPath = path.join(dirpath, file);
      const fileStat = await stat(fullPath);
      if (fileStat.isDirectory()) {
        const newRootPath = path.join(rootpath, file);
        await mkdir(newRootPath).catch(() => {}); // 如果文件夹已存在，忽略错误
        await uploadFolder(fullPath, newRootPath); // 递归上传子文件夹
      } else {
        await uploadFile(fullPath, rootpath);
      }
    }
  } catch (error) {
    console.error(`上传文件夹出错 ${dirpath}:`, error);
  }
};

const uploadToIndexedDB = async (itemPath, rootpath) => {
  try {
    // 检查 rootpath 是否存在，不存在则创建
    await stat(rootpath).catch(async () => {
      console.log(`根路径不存在，正在创建: ${rootpath}`);
      await mkdir(rootpath);
    });

    // 检查 itemPath 是文件还是文件夹
    const itemStat = await stat(itemPath);
    if (itemStat.isDirectory()) {
      // 如果是文件夹，则上传整个文件夹
      await uploadFolder(itemPath, rootpath);
    } else if (itemStat.isFile()) {
      // 如果是文件，则上传单个文件
      await uploadFile(itemPath, rootpath);
    } else {
      console.error(`路径既不是文件也不是文件夹: ${itemPath}`);
    }
  } catch (error) {
    console.error(`上传到IndexedDB出错:`, error);
  }
};

export default uploadToIndexedDB;
