/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-08-19 11:39:25
 */
import path from "path";
import { readFile } from "domain/filesystem";

function getTeXFiles(fileList) {
  const texFiles = [];
  fileList.forEach((filePath) => {
    const fileName = path.basename(filePath);
    if (fileName.match(/\.(tex|md|txt|tikz)$/i)) {
      texFiles.push({ name: fileName, path: filePath });
    }
  });
  return texFiles;
}

function getOnlyTeXFiles(fileList) {
  // console.log(fileList, "fileList");
  const texFiles = [];
  fileList.forEach((filePath) => {
    const fileName = path.basename(filePath);
    if (fileName.match(/\.(tex)$/i)) {
      texFiles.push(filePath);
    }
  });
  return texFiles;
}

function getImageFiles(fileList) {
  const imageFiles = [];
  fileList.forEach((filePath) => {
    const fileName = path.basename(filePath);
    if (fileName.match(/\.(eps|jpe?g|gif|png|tiff?|pdf|svg)$/i)) {
      imageFiles.push({ name: fileName, path: filePath });
    }
  });
  return imageFiles;
}

// 提取标签的函数
function extractLabels(text) {
  const regex = /\\label\{([^}]+)\}/g;
  const labels = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    labels.push(match[1]);
  }

  return labels;
}

async function extractLabelsFromTexFiles(fileList, currentProjectRoot) {
  const texFiles = getOnlyTeXFiles(fileList);
  const allLabels = new Set();

  for (const file of texFiles) {
    // Check if the file path is already absolute
    const filepath = path.isAbsolute(file)
      ? file
      : path.join(currentProjectRoot, file);
    try {
      const fileContent = await readFile(filepath, "utf-8");
      const labels = extractLabels(fileContent.toString());
      labels?.forEach((label) => allLabels.add(label));
    } catch (error) {
      console.error(`Error reading file ${filepath}:`, error);
    }
  }

  return Array.from(allLabels);
}

export {
  getTeXFiles,
  getImageFiles,
  getOnlyTeXFiles,
  extractLabelsFromTexFiles,
};
