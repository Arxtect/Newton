// To add a new version, copy and adjust one of the `importPDFJS*` functions below,
// add the variant to the "switch" statement, and add to `pdfjsVersions` in webpack.config.js

import "core-js/stable/global-this"; // polyfill for globalThis (used by pdf.js)
import "core-js/stable/promise/all-settled"; // polyfill for Promise.allSettled (used by pdf.js)
import "core-js/stable/structured-clone"; // polyfill for global.StructuredClone (used by pdf.js)
import "core-js/stable/array/at"; // polyfill for Array.prototype.at (used by pdf.js)

async function importPDFJS() {
  const cMapUrl = `/static/js/pdfjs-dist/cmaps/`;
  const standardFontDataUrl = `/static/media/fonts/pdfjs-dist`;
  const imageResourcesPath = `/static/media/images/pdfjs-dist/`;

  // ensure that PDF.js is loaded before importing the viewer
  const PDFJS = await import("pdfjs-dist/legacy/build/pdf");

  const [PDFJSViewer] = await Promise.all([
    import("pdfjs-dist/legacy/web/pdf_viewer"),
    import("pdfjs-dist/legacy/web/pdf_viewer.css"),
  ]);

  PDFJS.GlobalWorkerOptions.workerPort = new Worker(
    new URL("pdfjs-dist/legacy/build/pdf.worker.mjs", import.meta.url) // NOTE: .mjs extension
  );

  return {
    PDFJS,
    PDFJSViewer,
    cMapUrl,
    imageResourcesPath,
    standardFontDataUrl,
  };
}

export default importPDFJS();
