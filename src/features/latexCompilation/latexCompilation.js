// Import necessary modules for dynamic imports
import path from "path";
import fs from "fs";
import pify from "pify";
import {
  setReadyEngineStatus,
  setBusyEngineStatus,
  setErrorEngineStatus,
} from "store";
import {
  setCompiledPdfUrl,
  setCompilerLog,
  setShowCompilerLog,
  setCompileMessages,
  setLogInfo,
} from "store";
import { getAllFileNames } from "@/domain/filesystem";
import HumanReadableLogs from "./human-readable-logs/HumanReadableLogs";
import { pdftexEngine, xetexEngine, dviEngine } from "./loadEngines";

const IgnoreFile = [".DS_Store", ".gitignore", ".git"];

const fsPify = {
  readdir: pify(fs.readdir),
  stat: pify(fs.stat),
  readFile: pify(fs.readFile),
};

export const ensureFolderExists = async (list, currentProject, usePdfTeX) => {
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
      if (usePdfTeX) {
        pdftexEngine.makeMemFSFolder(directory);
      } else {
        xetexEngine.makeMemFSFolder(directory);
        dviEngine.makeMemFSFolder(directory);
      }
    }
  });
};

export const ensureFileExists = async (list, currentProject, usePdfTeX) => {
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
    console.log(filepath, fullFilename, currentProject, "filepath");
    if (usePdfTeX) {
      pdftexEngine.writeMemFSFile(filepath, fileBlob);
      if (path.extname(filepath) == ".tex") {
        const parsedPath = path.parse(filepath);
        const filenameWithPath = path.join(parsedPath.dir, parsedPath.name);

        pdftexEngine.writeMemFSFile(filenameWithPath, fileBlob);
      }
    } else {
      dviEngine.writeMemFSFile(filepath, fileBlob);
      xetexEngine.writeMemFSFile(filepath, fileBlob);
      if (path.extname(filepath) == ".tex") {
        const parsedPath = path.parse(filepath);
        const filenameWithPath = path.join(parsedPath.dir, parsedPath.name);

        dviEngine.writeMemFSFile(filenameWithPath, fileBlob);
        xetexEngine.writeMemFSFile(filenameWithPath, fileBlob);
      }
    }
  }
};

export const compileLatex = async (
  currentProject,
  mainFilepath = "main.tex",
  options,
  compileCount = 1
) => {
  const { isPdfLatex: usePdfTeX, nonstop } = options; // 在函数内部解构 options 参数
  let currentFileName = path.basename(mainFilepath);
  console.log(currentFileName, mainFilepath, "currentFileName");

  // Make sure the engines are ready for compilation
  if (usePdfTeX) {
    if (!pdftexEngine?.isReady()) {
      console.log("PDFTeX Engine not ready yet!");
      return;
    }
  } else {
    if (!xetexEngine?.isReady() || !dviEngine?.isReady()) {
      console.log("XeTeX or DVI Engine not ready yet!");
      return;
    }
  }

  // Set the engine status to be busy
  setBusyEngineStatus();

  // Create a temporary main.tex file
  // if (usePdfTeX) {
  //   console.log(latexCode, "latexCode");
  //   pdftexEngine.writeMemFSFile(currentFileName, latexCode);
  // } else {
  //   xetexEngine.writeMemFSFile(currentFileName, latexCode);
  // }
  let list = await getAllFileNames(currentProject);

  if (compileCount == 1) {
    let mainDirectory = path.dirname(mainFilepath);
    await ensureFolderExists(list, mainDirectory, usePdfTeX);
    await ensureFileExists(list, mainDirectory, usePdfTeX);
  }

  if (usePdfTeX) {
    // Associate the PDFTeX engine with this main.tex file
    pdftexEngine.setEngineMainFile(currentFileName);
    // Compile the main.tex file
    let pdftexCompilation = await pdftexEngine.compileLaTeX();
    // Print the compilation log
    let { errors, warnings, typesetting } = HumanReadableLogs.parse(
      pdftexCompilation.log,
      {
        ignoreDuplicates: true,
      }
    );

    setLogInfo({
      errorsLength: errors.length,
      warningsLength: warnings.length,
      typesettingLength: typesetting.length,
    });
    setCompilerLog(pdftexCompilation.log);
    setCompileMessages([...errors, ...warnings, ...typesetting]);

    console.log(errors, warnings, typesetting, "parserLog");
    let error = pdftexCompilation?.log?.includes("No pages of output.");
    // On successful compilation
    if ((nonstop || pdftexCompilation.status === 0) && !error) {
      if (!pdftexCompilation.pdf) {
        setErrorEngineStatus();
        setShowCompilerLog(true);
        await setCompiledPdfUrl("");
        return;
      }
      const pdfBlob = new Blob([pdftexCompilation.pdf], {
        type: "application/pdf",
      });
      console.log(pdftexCompilation.pdf, "blobUrl.pdf");
      if (compileCount < 3) {
        await compileLatex(
          currentProject,
          mainFilepath,
          options,
          compileCount + 1
        );
        return;
      }
      await setCompiledPdfUrl(URL.createObjectURL(pdfBlob));
      setShowCompilerLog(false);
      setReadyEngineStatus();
    } else {
      setErrorEngineStatus();
      setShowCompilerLog(true);
      await setCompiledPdfUrl("");
    }
  } else {
    // Associate the XeTeX engine with this main.tex file
    xetexEngine.setEngineMainFile(currentFileName);
    // Compile the main.tex file
    let xetexCompilation = await xetexEngine.compileLaTeX();
    // Print the compilation log
    let { errors, warnings, typesetting } = HumanReadableLogs.parse(
      xetexCompilation.log,
      {
        ignoreDuplicates: true,
      }
    );

    setLogInfo({
      errorsLength: errors.length,
      warningsLength: warnings.length,
      typesettingLength: typesetting.length,
    });
    setCompilerLog(xetexCompilation.log);
    setCompileMessages([...errors, ...warnings, ...typesetting]);

    let error = xetexCompilation?.log?.includes("No pages of output.");

    if ((nonstop || xetexCompilation.status === 0) && !error) {
      dviEngine.writeMemFSFile("main.xdv", xetexCompilation.pdf);
      let dviCompilation = await dviEngine.compilePDF();

      if (!dviCompilation.pdf) {
        setErrorEngineStatus();
        setShowCompilerLog(true);
        await setCompiledPdfUrl("");
        return;
      }
      const pdfBlob = new Blob([dviCompilation.pdf], {
        type: "application/pdf",
      });
      if (compileCount < 3) {
        await compileLatex(
          currentProject,
          mainFilepath,
          options,
          compileCount + 1
        );
        return;
      }
      await setCompiledPdfUrl(URL.createObjectURL(pdfBlob));
      setShowCompilerLog(false);
      setReadyEngineStatus();
    } else {
      setErrorEngineStatus();
      setShowCompilerLog(true);
      await setCompiledPdfUrl("");
    }
  }
};

export const graceCloseCompiler = () => {
  // if (pdftexEngine) {
  //   pdftexEngine.closeWorker();
  // }
  // if (xetexEngine) {
  //   xetexEngine.closeWorker();
  // }
  // if (dviEngine) {
  //   dviEngine.closeWorker();
  // }
};
