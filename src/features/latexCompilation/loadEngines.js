/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-09-14 16:45:24
 */
import { setReadyEngineStatus } from "store";

let pdftexEngine, xetexEngine, dviEngine;

const loadEngines = async () => {
  const { PdfTeXEngine } = await import("./swiftlatex/PdfTeXEngine");
  const { XeTeXEngine } = await import("./swiftlatex/XeTeXEngine");
  const { DvipdfmxEngine } = await import("./swiftlatex/DvipdfmxEngine");

  pdftexEngine = new PdfTeXEngine();
  xetexEngine = new XeTeXEngine();
  dviEngine = new DvipdfmxEngine();

  await Promise.all([
    pdftexEngine.loadEngine(),
    xetexEngine.loadEngine(),
    dviEngine.loadEngine(),
  ]);
};

const initializeLatexEngines = async () => {
  try {
    if (
      pdftexEngine === undefined ||
      xetexEngine === undefined ||
      dviEngine === undefined
    ) {
      await loadEngines();
    }
    setReadyEngineStatus();
  } catch (e) {
    console.log(e);
  }
};

export {
  loadEngines,
  pdftexEngine,
  xetexEngine,
  dviEngine,
  initializeLatexEngines,
};
