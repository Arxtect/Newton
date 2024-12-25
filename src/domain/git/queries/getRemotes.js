/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 13:51:21
 */
import fs from "fs";
import path from "path";
import pify from "pify";
import { parseGitConfig } from "@/utils";

export async function getRemotes(projectRoot) {
  try {
    // 尝试读取.git/config文件
    const configText = await pify(fs.readFile)(
      path.join(projectRoot, ".git/config")
    );
    // 将文件内容转换为字符串并解析
    const config = parseGitConfig(configText.toString());
    console.log(config, "config");
    // 返回解析后的远程仓库信息
    return config.remotes;
  } catch (error) {
    // 如果读取或解析过程中出现错误（例如文件不存在），则记录错误并返回空数组
    console.error("Error reading .git/config:", error);
    return ""; // 表示没有远程仓库
  }
}
export async function getRemotesUrl(projectRoot) {
  try {
    // 尝试读取.git/config文件
    const configText = await pify(fs.readFile)(
      path.join(projectRoot, ".git/config")
    );
    // 将文件内容转换为字符串并解析
    const config = parseGitConfig(configText.toString());
    console.log(config, "config");
    // 返回解析后的远程仓库信息
    return config.remoteUrl;
  } catch (error) {
    // 如果读取或解析过程中出现错误（例如文件不存在），则记录错误并返回空数组
    console.error("Error reading .git/config:", error);
    return ""; // 表示没有远程仓库
  }
}
