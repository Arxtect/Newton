/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 12:25:23
 */
import { openDB } from "idb";
import ini from "ini";

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
    .filter((t) => t.startsWith("remote "))
    .map((t) => {
      const m = t.match(/remote \"(.*)\"/);
      return m && m[1];
    });
  return { remotes, core: parsed.core };
}
