import { openDB } from 'idb';


function routerQuery() {
  let queryStr = window.location.search.substring(1);
  let vars = queryStr.split('&');
  const query = {};
  for (let i = 0; i < vars.length; i++) {
    let pair = vars[i].split('=');
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
  }
  return query;
}

function getRandomColor() {
  function randomColor() {
    let random = Math.random();
    if (random === 0) {
      return randomColor();
    }
    return `#${random.toString(16).substring(2, 8)}`;
  }
  return randomColor();
}

const initDB = async () => {
  const db = await openDB('fileDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'name' });
      }
    },
  });
  return db;
};

const loadFileNames = async () => {
  const db = await initDB();
  const tx = db.transaction('files', 'readonly');
  const files = await tx.store.getAllKeys();
  return files
};

const getFileContent = async (fileName) => {
  const db = await initDB();
  const tx = db.transaction('files', 'readonly');
  const file = await tx.store.get(fileName);
  return file?.content; // 假设文件内容存储在 'content' 字段中
};

export { routerQuery, getRandomColor, loadFileNames, initDB, getFileContent };