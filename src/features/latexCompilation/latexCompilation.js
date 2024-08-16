/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
// SwiftLaTeX engines
import { DvipdfmxEngine } from "./swiftlatex/DvipdfmxEngine";
import { XeTeXEngine } from "./swiftlatex/XeTeXEngine";

import {
  setReadyEngineStatus,
  setBusyEngineStatus,
  setErrorEngineStatus,
} from "store";
import { setCompiledPdfUrl, setCompilerLog, setShowCompilerLog } from "store";

import { getAllFileNames } from "@/domain/filesystem";
import path from "path";
import fs from "fs";
import pify from "pify";

const LATEX_FILE_EXTENSIONS = [
  ".tex",
  ".cls",
  ".sty",
  ".bib",
  ".aux",
  ".log",
  ".toc",
  ".lof",
  ".lot",
  ".idx",
  ".ind",
  ".ilg",
  ".glo",
  ".gls",
  ".ist",
  ".acn",
  ".acr",
  ".alg",
  ".glg",
  ".glsdefs",
  ".xdy",
  ".bst",
  ".eps",
  ".pdf",
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".bmp",
  ".svg",
  ".py",
  ".txt",
  ".sh",
];

const IgnoreFile = [
  ".DS_Store",
  ".gitignore",
  ".git"
]


const fsPify = {
  readdir: pify(fs.readdir),
  stat: pify(fs.stat),
  readFile: pify(fs.readFile),
};

// Global LaTeX engine objects
const xetexEngine = new XeTeXEngine(),
  dviEngine = new DvipdfmxEngine();

export const initializeLatexEngines = async () => {
  //* Wrapped in try ... catch to ignore multiple engine error message
  try {
    // Initialize the XeTeX engine
    await xetexEngine.loadEngine();
    // Initialize the DviPdfMx engine
    await dviEngine.loadEngine();
    // Set the engine status to be ready
    setReadyEngineStatus();
  } catch (e) {
    console.log(e);
  }
};

export const ensureFolderExists = async (list, currentProject) => {
  let directories = new Set();

  list.forEach((filePath) => {
    let filepath = path.relative(currentProject, filePath);
    console.log(`Relative path: ${filepath}`);
    // 提取文件夹路径
    let directory = filepath.substring(0, filepath.lastIndexOf("/"));
    console.log(`Extracted directory: ${directory}`);
    // 检查是否包含忽略文件夹
    let shouldIgnore = IgnoreFile.some((ignoreItem) =>
      directory.includes(ignoreItem)
    );

    if (!shouldIgnore && directory) {
      directories.add(directory);
    }
  });

  let allDirectories = new Set();

  directories.forEach((directory) => {
    let parts = directory.split("/");
    let currentPath = "";
    parts.forEach((part) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      allDirectories.add(currentPath);
    });
  });

  let sortedDirectories = Array.from(allDirectories).sort(
    (a, b) => a.length - b.length
  );

  console.log("All directories to be created:", sortedDirectories);

  sortedDirectories.forEach((directory) => {
    console.log(`Creating directory: ${directory}`);
    if (directory !== "" && directory !== "/" && directory !== ".") {
      xetexEngine.makeMemFSFolder(directory);
      dviEngine.makeMemFSFolder(directory);
    }
  });
};

export const ensureFileExists = async (list, currentProject) => {
  for (let i = 0; i < list.length; i++) {
    let fullFilename = list[i];
    let shouldIgnore = IgnoreFile.some((ignoreItem) =>
      fullFilename.includes(ignoreItem)
    );

    if (shouldIgnore) continue;

    let fileBlob = await fsPify.readFile(fullFilename);
    let filepath = path.relative(currentProject, fullFilename);
    let ext = path.extname(filepath);

    // if (LATEX_FILE_EXTENSIONS.includes(ext)) {
      console.log(filepath, "filepath");
      dviEngine.writeMemFSFile(filepath, fileBlob);
      xetexEngine.writeMemFSFile(filepath, fileBlob);
    // }
  }
};

export const compileLatex = async (latexCode, currentProject) => {
  // Make sure both engines are ready for compilation
  if (!xetexEngine.isReady() || !dviEngine.isReady()) {
    console.log("Engine not ready yet!");
    return;
  }

  // Set the engine status to be busy
  setBusyEngineStatus();

  // Create a temporary main.tex file
  xetexEngine.writeMemFSFile("main.tex", latexCode);

  let list = await getAllFileNames(currentProject);
  await ensureFolderExists(list,currentProject);
  await ensureFileExists(list, currentProject);
  
  // Associate the XeTeX engine with this main.tex file
  xetexEngine.setEngineMainFile("main.tex");
  // Compile the main.tex file
  let xetexCompilation = await xetexEngine.compileLaTeX();
  // Print the compilation log
  setCompilerLog(xetexCompilation.log);

  // On successfull first compilation continue with the second one
  if (xetexCompilation.status === 0) {
    // Download the frog image and add it to the virtual file system

    // Create a temporary main.xdv file from the XeTeX compilation result
    dviEngine.writeMemFSFile("main.xdv", xetexCompilation.pdf);

    let dviCompilation = await dviEngine.compilePDF();
    console.log(dviCompilation, "dviCompilation");
    // Create a blob out of the resulting PDF
    const pdfBlob = new Blob([dviCompilation.pdf], {
      type: "application/pdf",
    });

    // Create a temporary URL to this PDF blob
    await setCompiledPdfUrl(URL.createObjectURL(pdfBlob));
    setShowCompilerLog(false);
    // After compilation, the engine is ready again
    setReadyEngineStatus();
  } else {
    // If the compilation failed, reflect it with an error
    setErrorEngineStatus();
  }
};
