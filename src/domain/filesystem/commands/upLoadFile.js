import { uploadZip } from "./uploadZip";
import { writeInBrowser } from "./writeInBrowser";
import path from "path";

const uploadFile = async (fileList, dirpath, reload) => {
  let filePaths = []; // 用于收集所有生成的 filePath

  for (const file of fileList) {
    console.log(file, "file");
    if (file.name.endsWith(".zip")) {
      const filePathsList = await uploadZip(file, dirpath, reload); // 处理 ZIP 文件
      filePaths = [...filePaths, ...filePathsList];
    } else {
      const filePath = await writeInBrowser(file, dirpath, reload);
      filePaths.push(filePath); // 收集生成的 filePath
    }
  }
  console.log(filePaths, "filePaths");
  return filePaths; // 返回所有生成的 filePath
};

export { uploadFile };
