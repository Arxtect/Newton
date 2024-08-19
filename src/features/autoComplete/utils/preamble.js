function getPreambleText(currentDocValue) {
    const text = currentDocValue.slice(0, 5000);
    const preamble = text.match(/([^]*)^\\begin\{document\}/m)?.[1] || '';
    return preamble;
  }
  
  function getGraphicsPaths(currentDocValue) {
    let preamble = getPreambleText(currentDocValue);
    const graphicsPathsArgs = preamble.match(/\\graphicspath\{(.*)\}/)?.[1] || '';
    const paths = [];
    const re = /\{([^}]*)\}/g;
    let match;
    while ((match = re.exec(graphicsPathsArgs))) {
      paths.push(match[1]);
    }
    return paths;
  }
  
  export {getGraphicsPaths };