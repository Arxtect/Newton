const path = require("path");

const EXT_TO_FILETYPE_MAP = {
    ".md": "markdown",
    ".mdx": "markdown",
    ".css": "css",
    ".js": "javascript",
    ".json": "json",
    ".ts": "typescript"
};

function extToFileType(filepath) {
    const ext = path.extname(filepath);
    return EXT_TO_FILETYPE_MAP[ext] || "text";
}

export default extToFileType
