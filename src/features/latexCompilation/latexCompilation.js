/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
// SwiftLaTeX engines
import { DvipdfmxEngine } from "./swiftlatex/DvipdfmxEngine";
import { XeTeXEngine } from "./swiftlatex/XeTeXEngine";

// Redux store and actions
import store from "../../store";
import {
  setReadyEngineStatus,
  setBusyEngineStatus,
  setErrorEngineStatus,
} from "../engineStatus/engineStatusSlice";
import {
  setCompiledPdfUrl,
  setCompilerLog,
  setShowCompilerLog,
} from "../pdfPreview/pdfPreviewSlice";
import { loadFileNames, initDB, getFileContent } from "../../util";
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
];

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
    store.dispatch(setReadyEngineStatus());
  } catch (e) {
    console.log(e);
  }
};

export const compileLatex = async (latexCode) => {
  // Make sure both engines are ready for compilation
  if (!xetexEngine.isReady() || !dviEngine.isReady()) {
    console.log("Engine not ready yet!");
    return;
  }

  // Set the engine status to be busy
  store.dispatch(setBusyEngineStatus());

  // Create a temporary main.tex file
  xetexEngine.writeMemFSFile("main.tex", latexCode);

  const lists = [
    // "eg.eps",
    // "fancyplot.eps",
    // "exp.eps",
    // "expfig.eps",
    // "fsim.eps",
    // "nsim.eps",
    // "SREP-19-29377-T.dvi",
    // "SREP-19-29377-T.ps",
    "lmmono9-regular.otf",
  ];

  for (let i = 0; i < lists.length; i++) {
    let downloadReq = await fetch(`/assets/${lists[i]}`);
    let imageBlob = await downloadReq.arrayBuffer();

    xetexEngine.writeMemFSFile(`${lists[i]}`, new Uint8Array(imageBlob));
  }
  console.log(xetexEngine.isReady());

  let list = await loadFileNames();
  for (let i = 0; i < list.length; i++) {
    // 去掉文件名的后缀
    let fileNameWithoutExtension = list[i].split(".")[0];

    // 检查latexCode是否包含文件名（无后缀）或者文件名的前缀
    if (latexCode.includes(fileNameWithoutExtension)) {
      let downloadReq = await getFileContent(list[i]);
      let imageBlob = await downloadReq.arrayBuffer();

      xetexEngine.writeMemFSFile(`${list[i]}`, new Uint8Array(imageBlob));
      if (LATEX_FILE_EXTENSIONS.some((ext) => list[i].endsWith(ext))) {
        let fileContent = await downloadReq.text();
        for (let j = 0; j < list.length; j++) {
          let fileNameWithoutExtensions = list[j].split(".")[0];
          // 检查latexCode是否包含文件名（无后缀）或者文件名的前缀
          if (i !== j && fileContent.includes(fileNameWithoutExtensions)) {
            let nestedDownloadReq = await getFileContent(list[j]);
            let nestedImageBlob = await nestedDownloadReq.arrayBuffer();
            xetexEngine.writeMemFSFile(
              list[j],
              new Uint8Array(nestedImageBlob)
            );
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
  console.log(xetexCompilation.log);
  store.dispatch(setCompilerLog(xetexCompilation.log));

  // On successfull first compilation continue with the second one
  if (xetexCompilation.status === 0) {
    // Download the frog image and add it to the virtual file system

    // Create a temporary main.xdv file from the XeTeX compilation result
    dviEngine.writeMemFSFile("main.xdv", xetexCompilation.pdf);

    for (let i = 0; i < list.length; i++) {
      let fileNameWithoutExtension = list[i].split(".")[0];
      // 检查latexCode是否包含文件名（无后缀）或者文件名的前缀
      if (latexCode.includes(fileNameWithoutExtension)) {
        let downloadReq = await getFileContent(list[i]);
        let imageBlob = await downloadReq.arrayBuffer();

        dviEngine.writeMemFSFile(`${list[i]}`, new Uint8Array(imageBlob));
        if (LATEX_FILE_EXTENSIONS.some((ext) => list[i].endsWith(ext))) {
          let fileContent = await downloadReq.text();
          for (let j = 0; j < list.length; j++) {
            let fileNameWithoutExtensions = list[j].split(".")[0];
            // 检查latexCode是否包含文件名（无后缀）或者文件名的前缀
            if (i !== j && fileContent.includes(fileNameWithoutExtensions)) {
              let nestedDownloadReq = await getFileContent(list[j]);
              let nestedImageBlob = await nestedDownloadReq.arrayBuffer();
              dviEngine.writeMemFSFile(
                list[j],
                new Uint8Array(nestedImageBlob)
              );
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
    store.dispatch(setCompiledPdfUrl(URL.createObjectURL(pdfBlob)));
    store.dispatch(setShowCompilerLog(false));
    // After compilation, the engine is ready again
    store.dispatch(setReadyEngineStatus());
  } else {
    // If the compilation failed, reflect it with an error
    store.dispatch(setErrorEngineStatus());
  }
};

export const revokeCompiledPdfUrl = (pdfUrl) => {
  // Revoke the temporary URL to the PDF blob created in `compileLatex()`
  URL.revokeObjectURL(pdfUrl);
  console.log("Revoked URL");
};
