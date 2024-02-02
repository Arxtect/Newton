/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-01-25 13:51:21
 */
import fs from "fs";
import path from "path";
import pify from "pify";
import { parseGitConfig } from "../../../lib/parseGitConfig";

export async function getRemotes(projectRoot) {
  const configText = await pify(fs.readFile)(
    path.join(projectRoot, ".git/config")
  );
  const config = parseGitConfig(configText.toString());
  return config.remotes;
}
