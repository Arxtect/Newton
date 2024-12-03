import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import "mathjax-full/js/input/tex/AllPackages.js";

const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const baseExtensions = [
  "ams",
  "base",
  "boldsymbol",
  "color",
  "configmacros",
  "mathtools",
  "newcommand",
  "noerrors",
  "noundefined",
];

function createHtmlConverter(extensions) {
  // https://github.com/mathjax/MathJax/issues/1219
  const macrosOption = {
    bm: ["\\boldsymbol{#1}", 1],
  };
  const baseTexOption = {
    packages: extensions,
    macros: macrosOption,
    formatError: (_jax, error) => {
      throw new Error(error.message);
    },
  };
  const texInput = new TeX(baseTexOption);
  const svgOption = { fontCache: "local" };
  const svgOutput = new SVG(svgOption);
  return mathjax.document("", { InputJax: texInput, OutputJax: svgOutput });
}

let html = createHtmlConverter(baseExtensions);

function loadExtensions(extensions = []) {
  const extensionsToLoad = baseExtensions.concat(extensions);
  html = createHtmlConverter(extensionsToLoad);
}

function typeset(arg, opts) {
  const convertOption = {
    display: true,
    em: 18,
    ex: 9,
    containerWidth: 80 * 18,
  };
  const node = html.convert(arg, convertOption);

  const css = `svg {font-size: ${100 * opts.scale}%;} * { color: ${
    opts.color
  } }`;
  let svgHtml = adaptor.innerHTML(node);
  svgHtml = svgHtml.replace(/<defs>/, `<defs><style>${css}</style>`);
  return svgHtml;
}

export { typeset, loadExtensions };
