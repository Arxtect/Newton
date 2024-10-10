export function removeBibExtension(path) {
  return path.replace(/\.bib$/, "");
}

export function removeTexExtension(path) {
  return path.replace(/\.tex$/, "");
}

/**
 * Completions based on files in the project
 */
function buildIncludeCompletions(completions, fileList) {
  const processFile = (path) => {
    if (/\.(?:tex|txt)$/.test(path)) {
      completions.push({
        caption: path,
        snippet: path,
        meta: "env",
      });

      completions.push({
        caption: `\\include{${path}}`,
        snippet: `include{${removeTexExtension(path)}}`,
        meta: "cmd",
      });

      completions.push({
        caption: `\\input{${path}}`,
        snippet: `input{${removeTexExtension(path)}}`,
        meta: "cmd",
      });
    }

    if (/\.(eps|jpe?g|gif|png|tiff?|pdf|svg)$/i.test(path)) {
      completions.push({
        caption: path,
        snippet: path,
        meta: "file",
      });

      completions.push({
        caption: `\\includegraphics{${path}}`,
        snippet: `includegraphics{${path}}`,
        meta: "cmd",
      });
    }

    if (/\.bib$/.test(path)) {
      const label = removeBibExtension(path);
      completions.push({
        caption: label,
        snippet: label,
        meta: "bib",
      });
    }
  };

  const processFolder = (fileList) => {
    for (const path of fileList) {
      processFile(path);
    }
  };

  processFolder(fileList);
}

export { buildIncludeCompletions };
