/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-07 20:37:01
 */
import { readFile } from "../queries/readFile";
import { writeFile } from "./writeFile";

export async function copyFile(src, dest) {
  const data = await readFile(src);
  await writeFile(dest, data);
}
