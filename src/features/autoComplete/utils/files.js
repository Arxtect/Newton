import path from 'path';

function getTeXFiles(fileList) {
    const texFiles = [];
    fileList.forEach((filePath) => {
        const fileName = path.basename(filePath);
        if (fileName.match(/.*\.(tex|md|txt|tikz)/)) {
            texFiles.push({ name: fileName, path: filePath });
        }
    });
    return texFiles;
}

export { getTeXFiles };