/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-06-20 17:08:37
 */
import { writeFile } from "./writeFile";
import { readFile } from "../queries/readFile";
import { unlink } from "./unlink";
import path from "path";


const has = "hasOwnProperty-arxtect-projectInfo";

// 创建或更新项目信息文件的函数
export const createProjectInfo = async (projectRoot, additionalInfo = {}) => {
  const projectInfoPath = `${projectRoot}/project-${has}.json`;
  let existingInfo = {};

  try {
    // 尝试读取现有的项目信息文件
    const fileContent = await readFile(projectRoot);
    existingInfo = JSON.parse(fileContent);
  } catch (err) {
    // 如果文件不存在或解析失败，忽略错误
    if (err.code !== "ENOENT") {
      console.log("Error reading existing project info file: " + err);
    }
  }

  const { id, ...newAdditionalInfo } = additionalInfo;

  // 合并新的信息和现有的信息
  const projectInfo = {
    ...existingInfo,
    ...newAdditionalInfo,
    createdAt: existingInfo.createdAt || new Date().toISOString(), // 保留原始创建时间
  };

  try {
    await writeFile(projectInfoPath, JSON.stringify(projectInfo, null, 2));
  } catch (err) {
    console.log("Error writing project info file: " + err);
  }
};

// 获取项目信息文件的函数
export const getProjectInfo = async (projectRoot) => {
  const projectInfoPath = `${projectRoot}/project-${has}.json`;

  try {
    const fileContent = await readFile(projectInfoPath);
    return JSON.parse(fileContent); // 解析 JSON 字符串为对象
  } catch (err) {
    console.log("Error reading or parsing project info file: " + err);
    return null;
  }
};

// 检查项目信息文件是否存在的函数
export const projectInfoExists = (filename) => {
  const projectInfoPath = `project-${has}.json`;
  const basename = path.basename(filename);
  if (basename == projectInfoPath) return true;
  return false;
};

export const removeProjectInfo = async (projectRoot) => {
  const projectInfoPath = `${projectRoot}/project-${has}.json`;
  try {
    await unlink(projectInfoPath);
  } catch (err) {
    console.log("Error removing project info file: " + err);
  }
};
