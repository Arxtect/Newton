/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import { uploadZip } from "./uploadZip";
import { writeInBrowser } from "./writeInBrowser";
import path from "path";

const uploadFolder = async (fileList, dirpath, reload) => {
  let filePaths = []; // 用于收集所有生成的 filePath

  for (const file of fileList) {
    console.log(fileList, "fileList");
    console.log(file, "file");
    if (file.name.endsWith(".zip")) {
      const zipFilePath = path.dirname(file.webkitRelativePath || file.name);
      const zipDirPath = path.join(dirpath, zipFilePath);
      const filePathsList = await uploadZip(file, zipDirPath, reload); // 处理 ZIP 文件
      filePaths = [...filePaths, ...filePathsList];
    } else {
      await writeInBrowser(file, dirpath, reload); // 处理普通文件或文件夹
      const filePath = await writeInBrowser(file, dirpath, reload);
      filePaths.push(filePath); // 收集生成的 filePath
    }
  }
  console.log(filePaths, "filePaths");
  return filePaths; // 返回所有生成的 filePath
};

export { uploadFolder };
