import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useFileStore } from "@/store"; // 假设 Zustand 文件操作在这里定义
import path from "path";
import * as FS from "domain/filesystem";

const host = "206.190.239.91:9008";
const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `${wsProtocol}//${host}/websockets`;

class ProjectSync {
  constructor(rootPath, user, roomId, handleChange, otherOperation) {
    this.rootPath = rootPath;
    this.yDoc = new Y.Doc();
    this.handleChange = handleChange;
    this.websocketProvider = new WebsocketProvider(wsUrl, this.rootPath + roomId, this.yDoc);
    this.user = user;
    this.userList = [];
    this.awareness = this.websocketProvider.awareness;
    this.syncLock = false; // 初始化锁

    // 使用 rootPath 作为命名空间
    this.yMap = this.yDoc.getMap(this.rootPath + roomId);
    this.yMap.observe(this.yMapObserveHandler.bind(this));

    // 设置用户信息
    this.setUserAwareness(user);

    // 监听 awareness 变化
    this.awareness.on('change', this.awarenessChangeHandler.bind(this));
    setTimeout(() => otherOperation && otherOperation(), 500);
  }

  // 设置用户信息到 awareness
  setUserAwareness(user) {
    this.awareness.setLocalStateField('user', user);
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
    if (this.syncLock) {
      console.log("Sync is already in progress. Please wait.");
      return;
    }

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

  // 等待锁释放
  async waitForUnlock() {
    while (this.syncLock) {
      await new Promise(resolve => setTimeout(resolve, 100)); // 每100ms检查一次锁状态
    }
  }



  async syncFolderToYMapRootPath() {
    await this.waitForUnlock(); // 等待锁释放
    await this.syncFolderToYMap(this.rootPath);
  }

  // 同步单个文件到 Yjs Map
  async syncFileToYMap(filePath) {
    await this.waitForUnlock(); // 等待锁释放
    this.syncLock = true; // 加锁

    try {
      const content = await this.readFile(filePath);
      this.syncToYMap(filePath, content);
    } catch (err) {
      console.error(`Error syncing file ${filePath}:`, err);
      throw err;
    } finally {
      this.syncLock = false; // 解锁
    }
  }

  // Yjs Map 观察者处理函数
  async yMapObserveHandler(event) {
    this.syncLock = true; // 解锁
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
      } finally {
        this.syncLock = false; // 解锁
      }
    });
  }

  // Awareness 变化处理函数
  awarenessChangeHandler({ added, updated, removed }) {
    const states = this.awareness.getStates();
    const uniqueUsers = new Set();

    states.forEach(state => {
      if (state.user) {
        uniqueUsers.add(JSON.stringify(state.user)); // 使用 JSON 字符串来确保唯一性
      }
    });
    // 将 Set 转换回数组并解析 JSON 字符串
    this.userList = Array.from(uniqueUsers).map(user => JSON.parse(user));

    // console.log("Users added:", added.map(id => states.get(id)));
    // console.log("Users updated:", updated.map(id => states.get(id)));
    // console.log("Users removed:", removed.map(id => states.get(id)));
    console.log(this.userList, 'users added')
  }

  // 获取当前在线用户信息
  getCurrentUsers() {
    const states = this.awareness.getStates();
    const users = [];
    states.forEach((state, clientID) => {
      users.push({ clientID, ...state.user });
    });
    return users;
  }

  // 清理函数
  cleanup() {
    this.yMap.unobserve(this.yMapObserveHandler);
    this.awareness.off('change', this.awarenessChangeHandler);
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
