//
//                                  _oo8oo_
//                                 o8888888o
//                                 88" . "88
//                                 (| -_- |)
//                                 0\  =  /0
//                               ___/'==='\___
//                             .' \\|     |// '.
//                            / \\|||  :  |||// \
//                           / _||||| -:- |||||_ \
//                          |   | \\\  -  /// |   |
//                          | \_|  ''\---/''  |_/ |
//                          \  .-\__  '-'  __/-.  /
//                        ___'. .'  /--.--\  '. .'___
//                     ."" '<  '.___\_<|>_/___.'  >' "".
//                    | | :  `- \`.:`\ _ /`:.`/ -`  : | |
//                    \  \ `-.   \_ __\ /__ _/   .-` /  /
//                =====`-.____`.___ \_____/ ___.`____.-`=====
//                                  `=---=`
//
//                          佛祖保佑         永无bug
//
import { openDB } from "idb";
import ini from "ini";
import { format } from "date-fns";
import { pdfjs } from "react-pdf";
import path from "path";
import { textExtensions, editableFilenames } from "@/constant";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export function routerQuery() {
  let queryStr = window.location.search.substring(1);
  let vars = queryStr.split("&");
  const query = {};
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split("=");
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return query;
}

export function getRandomColor() {
  function randomColor() {
    let random = Math.random();
    if (random === 0) {
      return randomColor();
    }
    return `#${random.toString(16).substring(2, 8)}`;
  }
  return randomColor();
}

export const initDB = async () => {
  const db = await openDB("fileDB", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("files")) {
        db.createObjectStore("files", { keyPath: "name" });
      }
    },
  });
  return db;
};

export const savePdfToIndexedDB = async (projectRoot, pdfBlobUrl) => {
  // 首先执行异步操作获取 PDF 的 ArrayBuffer
  const response = await fetch(pdfBlobUrl);
  const pdfBlob = await response.blob();
  const pdfArrayBuffer = await pdfBlob.arrayBuffer();

  // 异步操作完成后，初始化数据库并创建事务
  const db = await initDB();
  const tx = db.transaction("files", "readwrite");
  const store = tx.objectStore("files");

  // 将获取到的数据存入 IndexedDB
  store.put({ name: projectRoot, content: pdfArrayBuffer });

  // 等待事务完成
  await tx.done;
};

export const getPdfFromIndexedDB = async (projectRoot) => {
  const db = await initDB();
  const tx = db.transaction("files", "readonly");
  const file = await tx.store.get(projectRoot);

  // 如果文件存在，则将ArrayBuffer转换为Blob
  if (file && file.content) {
    return new Blob([file.content], { type: "application/pdf" });
  }

  return null; // 如果文件不存在，返回null
};

export const loadFileNames = async () => {
  const db = await initDB();
  const tx = db.transaction("files", "readonly");
  const files = await tx.store.getAllKeys();
  return files;
};

export const getFileContent = async (fileName) => {
  const db = await initDB();
  const tx = db.transaction("files", "readonly");
  const file = await tx.store.get(fileName);
  return file?.content; // 假设文件内容存储在 'content' 字段中
};

export function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

// 获取 cookie
export function getCookie(name) {
  const matches = document.cookie.match(
    new RegExp(
      `(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1")}=([^;]*)`
    )
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

// 删除 cookie
export function deleteCookie(name) {
  setCookie(name, "", -1);
}

export function getPreViewUrl(urlId) {
  console.log(window.location.origin, "window.location.origin");
  return window.location.origin + `/api/v1/documents/pre/preview/${urlId}`;
}

export function parseGitConfig(text) {
  const parsed = ini.parse(text);
  const remotes = Object.keys(parsed)
    .filter((t) => t?.startsWith("remote "))
    .map((t) => {
      const m = t.match(/remote \"(.*)\"/);
      return m && m[1];
    });
  const remoteUrl = parsed['remote "origin"']?.url; // 使用可选链避免undefined错误
  return { remotes, core: parsed.core, remoteUrl };
}

export const gitCommandSuccess = (status, options = {}) => {
  return {
    code: 200,
    status: status,
    ...options,
  };
};

export const gitCommandError = (message, options = {}) => {
  return {
    code: 500,
    message: message,
    ...options,
  };
};

export const formatDate = (date) => {
  return format(new Date(date), "yyyy-MM-dd HH:mm:ss");
};

/**
 * 获取PDF第一页的图像URL
 * @param {String} pdfUrl PDF文件的URL
 * @return {Promise<String>} 返回一个promise，解析为图像的DataURL
 */
export async function getPdfFirstPageImageUrl(pdfUrl) {
  try {
    const loadingTask = pdfjs.getDocument(pdfUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;

    return canvas.toDataURL();
  } catch (error) {
    console.error("Error loading PDF:", error);
    return "";
  }
}

export async function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

export async function pdfToImageFirst(pdfUrl) {
  const pdf = await getPdfFirstPageImageUrl(pdfUrl);
  const blob = await dataURLtoBlob(pdf);
  return blob;
}

export function isAssetExtension(filename) {
  const extension = path.extname(filename).slice(1).toLowerCase();
  const basename = path.basename(filename);
  const isEditableTextFile =
    textExtensions.includes(extension) ||
    editableFilenames.includes(basename.toLowerCase());

  if (!isEditableTextFile) {
    return true;
  }
  return false;
}

export const mimeTypes = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  gif: "image/gif",
  bmp: "image/bmp",
  pdf: "application/pdf",
  mp4: "video/mp4",
  mp3: "audio/mpeg",
  wav: "audio/wav",
};

export function getMimeType(extension) {
  return mimeTypes[extension.toLowerCase()] || "application/octet-stream";
}

export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

export function isNullOrUndefined(value) {
  return value === undefined || value === null;
}

export function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getGiteaFullUrl(userName, repoName) {
  let remoteUrl = window.origin + "/git/" + userName + "/" + repoName + ".git";
  return remoteUrl;
}

export function getColors(i) {
  const colors = [
    "#42c0b0",
    "#4caf4f",
    "#acae4c",
    "#babdfb",
    "#A133FF",
    "#33FFA1",
    "#FF5733",
    "#FFC300",
    "#DAF7A6",
  ];

  if (typeof i === "number" && i >= 0) {
    return colors[i];
  } else if (i > colors.length) {
    return colors[colors.length - 1];
  } else {
    return colors[Math.floor(Math.random() * colors.length)];
  }
}

const chars =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_";

export function randomString(length) {
  let result = "";
  for (let i = length; i > 0; --i)
    result += chars[Math.floor(Math.random() * chars.length)];
  return result;
}

export const getFirstNUpperCaseChars = (str, length = 1) => {
  if (!str) {
    return ""; // 如果输入字符串为空，返回空字符串
  }

  const firstNChars = str.slice(0, length); // 取前n个字符
  const upperCaseChars = firstNChars.toUpperCase(); // 转换为大写

  return upperCaseChars;
};

export function extractLatex(markdown) {
  const latexBlockRegex = /```latex\s*([\s\S]*?)\s*```/g;
  let matches = [];
  let match;
  while ((match = latexBlockRegex.exec(markdown)) !== null) {
    const content = match[1]
      .split("\n")
      .map((line) => line.trim())
      .join("\n");
    matches.push(content);
  }
  return matches?.[0] || "";
}

export const test = () => {
  console.log("test");
};

export function formatRepoName(input) {
  // 替换不符合要求的字符为下划线
  let formatted = input.replace(/[^a-zA-Z0-9._-]/g, "_");

  // 确保名称长度在1到100个字符之间
  if (formatted.length > 100) {
    formatted = formatted.substring(0, 100);
  } else if (formatted.length === 0) {
    formatted = "default_repo_name";
  }

  // 确保名称不以连字符或点开头或结尾
  formatted = formatted.replace(/^[.-]+|[.-]+$/g, "");

  return formatted;
}

export function waitForCondition({
  condition,
  onSuccess,
  onFailure,
  intervalTime = 100,
  maxElapsedTime = 60000,
}) {
  let elapsedTime = 0;

  const intervalId = setInterval(() => {
    if (condition()) {
      clearInterval(intervalId);
      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } else if (elapsedTime >= maxElapsedTime) {
      clearInterval(intervalId);
      if (typeof onFailure === "function") {
        onFailure();
      }
    }

    elapsedTime += intervalTime;
  }, intervalTime);
}
