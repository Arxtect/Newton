/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
// SwiftLaTeX engines
import { DvipdfmxEngine } from "./swiftlatex/DvipdfmxEngine";
import { XeTeXEngine } from "./swiftlatex/XeTeXEngine";
import { convertEPStoJPEG } from "./convertEps";

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
  } catch (e) {}
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

  const list = [
    "eg.eps",
    "fancyplot.eps",
    "exp.eps",
    "expfig.eps",
    "fsim.eps",
    "nsim.eps",
    "SREP-19-29377-T.dvi",
    "SREP-19-29377-T.ps",
    "frog.jpg",
  ];

  for (let i = 0; i < list.length; i++) {
    let downloadReq = await fetch(`/assets/article/${list[i]}`);
    let imageBlob = await downloadReq.arrayBuffer();

    xetexEngine.writeMemFSFile(`${list[i]}`, new Uint8Array(imageBlob));
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
      let downloadReq;
      if (list[i].includes("eps")) {
        const res = await convertEPStoJPEG(`/assets/article/${list[i]}`);
        console.log(res, "res");
        downloadReq = await fetch(res);
      } else {
        downloadReq = await fetch(`/assets/article/${list[i]}`);
      }

      let imageBlob = await downloadReq.arrayBuffer();
      dviEngine.writeMemFSFile(`${list[i]}`, new Uint8Array(imageBlob));
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
