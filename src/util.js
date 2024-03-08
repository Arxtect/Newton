/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 12:25:23
 */
import { openDB } from "idb";
import ini from "ini";
import { format } from "date-fns";

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
