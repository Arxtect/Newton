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
import { loadFileNames, initDB, getFileContent } from "@/util";

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
];

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

  // const lists = [
  // "eg.eps",
  // "fancyplot.eps",
  // "exp.eps",
  // "expfig.eps",
  // "fsim.eps",
  // "nsim.eps",
  // "SREP-19-29377-T.dvi",
  // "SREP-19-29377-T.ps",
  //   "lmmono9-regular.otf",
  // ];

  // for (let i = 0; i < lists.length; i++) {
  //   let downloadReq = await fetch(`/assets/${lists[i]}`);
  //   let imageBlob = await downloadReq.arrayBuffer();

  //   xetexEngine.writeMemFSFile(`${lists[i]}`, new Uint8Array(imageBlob));
  // }
  let list = await getAllFileNames(currentProject);
  console.log(list, "list");
  for (let i = 0; i < list.length; i++) {
    // 去掉文件名的后缀
    let filename = path.basename(list[i]);
    let fileNameWithoutExtension = filename.split(".")[0];

    // 检查latexCode是否包含文件名（无后缀）或者文件名的前缀
    if (latexCode.includes(fileNameWithoutExtension)) {
      console.log(list[i], "list");
      let imageBlob = await fsPify.readFile(list[i]);

      xetexEngine.writeMemFSFile(`${filename}`, imageBlob);
      if (LATEX_FILE_EXTENSIONS.some((ext) => filename.endsWith(ext))) {
        let fileContent = await imageBlob.toString();
        for (let j = 0; j < list.length; j++) {
          let newFilename = path.basename(list[j]);
          let fileNameWithoutExtensions = newFilename.split(".")[0];
          // 检查latexCode是否包含文件名（无后缀）或者文件名的前缀
          if (i !== j && fileContent.includes(fileNameWithoutExtensions)) {
            let nestedImageBlob = await fsPify.readFile(list[j]);
            xetexEngine.writeMemFSFile(newFilename, nestedImageBlob);
          }
        }
      }
    }
  }

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

    for (let i = 0; i < list.length; i++) {
      // 去掉文件名的后缀
      let filename = path.basename(list[i]);
      let fileNameWithoutExtension = filename.split(".")[0];

      // 检查latexCode是否包含文件名（无后缀）或者文件名的前缀
      if (latexCode.includes(fileNameWithoutExtension)) {
        console.log(list[i], "list[i]");
        let imageBlob = await fsPify.readFile(list[i]);

        dviEngine.writeMemFSFile(`${filename}`, imageBlob);
        if (LATEX_FILE_EXTENSIONS.some((ext) => filename.endsWith(ext))) {
          let fileContent = await imageBlob.toString();
          for (let j = 0; j < list.length; j++) {
            let newFilename = path.basename(list[j]);
            let fileNameWithoutExtensions = newFilename.split(".")[0];
            // 检查latexCode是否包含文件名（无后缀）或者文件名的前缀
            if (i !== j && fileContent.includes(fileNameWithoutExtensions)) {
              let nestedImageBlob = await fsPify.readFile(list[j]);
              dviEngine.writeMemFSFile(newFilename, nestedImageBlob);
            }
          }
        }
      }
    }

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
