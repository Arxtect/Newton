import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { ProjectSync } from "./projectSync";

const host = "206.190.239.91:9008";
const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `${wsProtocol}//${host}/websockets`;

// 创建 Y.Doc 实例
const yDoc = new Y.Doc();
const provider = new WebsocketProvider(wsUrl, "file-sync", yDoc);
const awareness = provider.awareness;

// 创建 ProjectSync 实例
const createProjectSync = (rootPath) => {
  const projectSync = new ProjectSync(
    rootPath,
    yDoc,
    awareness,
    (filePath, content) => {
      console.log("File changed:", filePath, content);
    },
    provider
  );

  // 同步整个文件夹
  projectSync.syncFolderToYMapRootPath();

  return projectSync;
};

// 测试文件同步操作
const testFileSync = async (projectSync, filePath, content) => {
  try {
    await projectSync.writeFile(filePath, content);
    const readContent = await projectSync.readFile(filePath);
    console.log(readContent);
  } catch (err) {
    console.error(err);
  }
};

export const syncTest = () => {
  const fileSync = createProjectSync("inform7");

  testFileSync(fileSync, "inform7/test.txt", "Hello, world!");
};

export const syncTestCo = () => {
  const fileSync = createProjectSync("inform7");

  testFileSync(fileSync, "inform7/test22.txt", "Hello, world!");
};
