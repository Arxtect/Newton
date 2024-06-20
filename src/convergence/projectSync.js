import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useFileStore } from "@/store"; // 假设 Zustand 文件操作在这里定义
import path from "path";
import * as FS from "domain/filesystem";

class ProjectSync {
  constructor(rootPath, yDoc, awareness, handleChange, websocketProvider) {
    this.rootPath = rootPath;
    this.yDoc = yDoc;
    this.awareness = awareness;
    this.handleChange = handleChange;
    this.websocketProvider = websocketProvider;

    // 使用 rootPath 作为命名空间
    this.yMap = this.yDoc.getMap(rootPath);
    this.yMap.observe(this.yMapObserveHandler.bind(this));
  }

  // 读取文件内容
  async readFile(filePath) {
    try {
      const fileContent = await FS.readFile(filePath);
      return fileContent.toString();
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // 写入文件内容
  async writeFile(filePath, content) {
    try {
      console.log(content, "content");
      await FS.writeFile(filePath, content);
      this.syncToYMap(filePath, content);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // 删除文件
  async deleteFile(filePath) {
    try {
      const fileStore = useFileStore.getState();
      await fileStore.deleteFile({ filename: filePath });
      this.yDoc.transact(() => {
        this.yMap.delete(filePath);
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // 创建文件夹
  async createFolder(folderPath) {
    try {
      const fileStore = useFileStore.getState();
      await fileStore.finishDirCreating({
        dirpath: folderPath,
      });
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  // 同步文件内容到 Yjs Map
  syncToYMap(filePath, content) {
    this.yDoc.transact(() => {
      this.yMap.set(filePath, content);
    });
  }

  // 同步整个文件夹到 Yjs Map
  async syncFolderToYMap(folderPath) {
    try {
      const files = await FS.readFileStats(folderPath);
      console.log(files, "files");

      for (const file of files) {
        const filePath = path.join(folderPath, file.name); // 使用 path.join 进行路径拼接

        if (file.type == "file") {
          const content = await this.readFile(filePath);
          this.syncToYMap(filePath, content); // 只同步相对路径
        } else if (file.type == "dir") {
          await this.syncFolderToYMap(filePath); // 递归同步子文件夹
        }
      }
    } catch (err) {
      console.error(`Error syncing folder ${folderPath}:`, err);
      throw err;
    }
  }

  async syncFolderToYMapRootPath() {
    this.syncFolderToYMap(this.rootPath);
  }

  // Yjs Map 观察者处理函数
  async yMapObserveHandler(event) {
    event.keysChanged.forEach(async (key) => {
      const content = this.yMap.get(key);
      try {
        console.log(key, "key");
        const dirpath = path.dirname(key);
        await FS.ensureDir(dirpath);
        const fileStore = useFileStore.getState();
        await fileStore.saveFile(key, content, false, false);
        // this.handleChange(key, content);
      } catch (err) {
        console.error(err);
      }
    });
  }

  // 清理函数
  cleanup() {
    this.yMap.unobserve(this.yMapObserveHandler);
  }

  // 彻底关闭协作进程
  async closeCollaboration() {
    // 清理 Yjs 数据
    this.clearYDoc(this.rootPath);

    // 清理 Yjs 观察者
    this.cleanup();

    // 关闭 WebSocket 连接
    if (this.websocketProvider) {
      this.websocketProvider.disconnect();
    }

    // 通知协作人员
    if (this.websocketProvider && this.websocketProvider.wsconnected) {
      const message = {
        type: "collaborationClosed",
        payload: {
          message: "The collaboration has been closed by the creator.",
        },
      };
      this.websocketProvider.ws.send(JSON.stringify(message));
    }

    // 通知服务器协作已经关闭并清除服务器数据
    await this.notifyServer("collaborationClosed");
  }

  // 清空指定命名空间下的 Yjs 数据
  clearYDoc(namespace) {
    this.yDoc.transact(() => {
      const yMap = this.yDoc.getMap(namespace);
      yMap.clear(); // 清空命名空间下的所有数据
    });
  }

  // 离开协作进程
  leaveCollaboration() {
    // 清理 Yjs 观察者
    this.cleanup();

    // 断开 WebSocket 连接
    if (this.websocketProvider) {
      this.websocketProvider.disconnect();
    }

    // 通知协作人员
    if (this.websocketProvider && this.websocketProvider.wsconnected) {
      const message = {
        type: "collaboratorLeft",
        payload: {
          message: "A collaborator has left the session.",
        },
      };
      this.websocketProvider.ws.send(JSON.stringify(message));
    }
  }
}

export { ProjectSync };
