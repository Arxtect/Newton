import path from 'path';

function getGraphicsFiles(fileList) {
    const graphicsFiles = [];
    fileList.forEach((filePath) => {
        const fileName = path.basename(filePath);
        if (fileName.match(/.*\.(png|jpg|jpeg|pdf|eps)/i)) {
            graphicsFiles.push({ name: fileName, path: filePath });
        }
    });
    return graphicsFiles;
}


export {getGraphicsFiles};