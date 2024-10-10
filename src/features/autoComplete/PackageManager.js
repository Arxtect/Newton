/* eslint-disable
    max-len,
*/
// TODO: This file was created by bulk-decaffeinate.
// Fix any style issues and re-enable lint.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const packagesList = [
  "inputenc",
  "graphicx",
  "amsmath",
  "geometry",
  "amssymb",
  "hyperref",
  "babel",
  "color",
  "xcolor",
  "url",
  "natbib",
  "fontenc",
  "fancyhdr",
  "amsfonts",
  "booktabs",
  "amsthm",
  "float",
  "tikz",
  "caption",
  "setspace",
  "multirow",
  "array",
  "multicol",
  "titlesec",
  "enumitem",
  "ifthen",
  "listings",
  "blindtext",
  "subcaption",
  "times",
  "bm",
  "subfigure",
  "algorithm",
  "fontspec",
  "biblatex",
  "tabularx",
  "microtype",
  "etoolbox",
  "parskip",
  "calc",
  "verbatim",
  "mathtools",
  "epsfig",
  "wrapfig",
  "lipsum",
  "cite",
  "textcomp",
  "longtable",
  "textpos",
  "algpseudocode",
  "enumerate",
  "subfig",
  "pdfpages",
  "epstopdf",
  "latexsym",
  "lmodern",
  "pifont",
  "ragged2e",
  "rotating",
  "dcolumn",
  "xltxtra",
  "marvosym",
  "indentfirst",
  "xspace",
  "csquotes",
  "xparse",
  "changepage",
  "soul",
  "xunicode",
  "comment",
  "mathrsfs",
  "tocbibind",
  "lastpage",
  "algorithm2e",
  "pgfplots",
  "lineno",
  "graphics",
  "algorithmic",
  "fullpage",
  "mathptmx",
  "todonotes",
  "ulem",
  "tweaklist",
  "moderncvstyleclassic",
  "collection",
  "moderncvcompatibility",
  "gensymb",
  "helvet",
  "siunitx",
  "adjustbox",
  "placeins",
  "colortbl",
  "appendix",
  "makeidx",
  "supertabular",
  "ifpdf",
  "framed",
  "aliascnt",
  "layaureo",
  "authblk",
];

class PackageManager {
  constructor(fileList) {
    // this.metadataManager = metadataManager
    this.packages = this.parsePackages(fileList);
  }

  parsePackages(fileList) {
    const packages = new Set();
    for (const file of fileList) {
      if (file.endsWith(".sty")) {
        const packageName = file.replace(/\.sty$/, ""); // 去掉 .sty 后缀
        packages.add(packageName);
      }
    }

    // 确保 packagesList 是一个数组
    if (!Array.isArray(packagesList)) {
      throw new TypeError("packagesList should be an array");
    }

    // 将 Set 转换为数组，并与 packagesList 组合
    return [...packages, ...packagesList];
  }

  getCompletions(editor, session, pos, prefix, callback) {
    // const usedPackages = Object.keys(this.metadataManager.getAllPackages())
    const packageSnippets = [];
    for (const pkg of Array.from(this.packages)) {
      // if (!Array.from(usedPackages).includes(pkg)) {
      packageSnippets.push({
        caption: `${pkg}`,
        snippet: `${pkg}`,
        meta: "pkg",
      });
      // }
    }

    return callback(null, packageSnippets);
  }
}

export default PackageManager;
