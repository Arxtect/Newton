import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useFileStore } from "@/store"; // 假设 Zustand 文件操作在这里定义
import path from "path";
import * as FS from "domain/filesystem";
import { AceBinding } from "./ace-binding"; // 导入AceBinding

const host = window.location.hostname;
// const host = "206.190.239.91:9008";
const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
// const wsUrl = `${wsProtocol}//${host}/websockets`;
const wsUrl = `wss://arxtect.com/websockets`

class ProjectSync {
  constructor(rootPath, user, roomId, otherOperation) {
    this.rootPath = rootPath;
    this.roomId = roomId;
    this.yDoc = new Y.Doc();
    this.websocketProvider = new WebsocketProvider(
      wsUrl,
      this.rootPath + this.roomId,
      this.yDoc
    );
    this.user = {
      ...user,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    };
    this.userList = [];
    this.awareness = this.websocketProvider.awareness;
    this.currentFilePath = "";
    this.isLocalChange = true; // 是否本地变更

    // 设置用户信息
    this.setUserAwareness(this.user);

    // 使用 rootPath 作为命名空间
    this.yMap = this.yDoc.getMap(this.rootPath + this.roomId);
    // this.setObserveHandler();

    // 监听 awareness 变化
    // this.awareness.on("change", this.awarenessChangeHandler.bind(this));
    this.otherOperation = otherOperation && otherOperation; // 保存回调函数
    this.isExistAllFile = false;

    // 初始化光标同步实例
    // this.aceBinding = new AceBinding(this.awareness);
  }

  // set observe handler
  setObserveHandler(editor) {
    this.yMap.observe(this.yMapObserveHandler.bind(this, editor));
  }

  async saveProjectSyncInfoToJson() {
    const { id, ...otherInfo } = this.user;
    await FS.createProjectInfo(this.rootPath, {
      rootPath: this.rootPath,
      userId: this.roomId,
      isSync: true,
      ...otherInfo,
    });
  }

  async removeProjectSyncInfo() {
    await FS.removeProjectInfo(this.rootPath);
  }

  // 设置用户信息到 awareness
  setUserAwareness(user) {
    this.awareness.setLocalStateField("user", user);
  }

  //同步文件内容到 Yjs Map
  syncToYMap(filePath, content) {
    this.yDoc.transact(() => {
      this.yMap.set(filePath, content);
    });
  }

  setEditorContent(content) {
    const handleChange = useFileStore.getState().changeValue;
    handleChange(content, false);
  }

  handleInput(e, editor) {
    if (!this.currentFilePath) {
      console.error("No file is currently being edited.");
      return;
    }

    console.log(e, "e");
    const { action, lines, start } = e;
    const position = start.row * start.column; // 计算插入位置

    console.log(action, "inputType");
    const newVal = this.getVal(); // 假设getVal是一个方法
    const newRange = this.getRange(); // 假设getRange是一个方法
    if (action == "insert") {
      this.yDoc.transact(() => {
        let length = this.yText.toString().length;
        new Promise((resolve, reject) => {
          this.yText.delete(0, length);
          this.undoManager.redo();
          resolve();
        }).then(() => {
          console.log(this.yText.toString(), "de");
        });
      }, this.yDoc.clientID);
    } else if (action == "remove") {
      this.yDoc.transact(() => {
        let length = this.yText.toString().length;
        this.yText.delete(0, length);
        this.undoManager.undo();
        this.yText.insert(0, this.getVal());
      }, this.yDoc.clientID);
    } else if (action === "historyUndo") {
      this.undoManager.undo();
    } else if (action === "historyRedo") {
      this.undoManager.redo();
    }
    if (this.isCurrentFile(editor, this.currentFilePath)) {
      // this.aceBinding._cursorObserver(editor);
    }
  }

  isCurrentFile(editor, filePath) {
    return (
      editor != null && this.currentFilePath && filePath == this.currentFilePath
    );
  }

  updateEditorAndCurrentFilePath(filePath, editor) {
    this.currentFilePath = filePath;
    this.yText = this.yDoc.getText(filePath);
    this.undoManager = new Y.UndoManager(this.yText);
    console.log(editor, filePath, "editor1231231");
    this.setObserveHandler(editor);

    // Initialize AceBinding for cursor synchronization
    if (this.isCurrentFile(editor, this.currentFilePath)) {
      // Initialize AceBinding for cursor synchronization
      // this.aceBinding.init(editor, this.yText); // 初始化 AceBinding 实例
    }

    editor.getSession().on("change", (e) => {
      this.handleInput(e, editor);
    });
  }

  getVal() {
    // 实现获取当前文本内容的方法
    return this.yText.toString();
  }

  getRange() {
    // 实现获取当前选择范围的方法
    // 这里假设返回一个默认值
    return [0, this.yText.length];
  }

  // 同步单个文件到 Yjs Map
  async syncFileToYMap(filePath, content) {
    await this.waitForUnlock(); // 等待锁释放

    try {
      this.syncToYMap(filePath, content);
    } catch (err) {
      console.error(`Error syncing file ${filePath}:`, err);
      throw err;
    } finally {
    }
  }

  // 同步整个文件夹到 Yjs Map
  async syncFolderToYMap(folderPath) {
    if (this.syncLock) {
      console.log("Sync is already in progress. Please wait.");
      return;
    }

    try {
      const files = await FS.readFileStats(folderPath, false);

      console.log(files, "files");

      for (const file of files) {
        const filePath = path.join(folderPath, file.name); // 使用 path.join 进行路径拼接

        if (file.type == "file") {
          const content = await FS.readFile(filePath);
          this.syncToYMap(filePath, content.toString()); // 只同步相对路径
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
      await new Promise((resolve) => setTimeout(resolve, 100)); // 每100ms检查一次锁状态
    }
  }

  async syncFolderToYMapRootPath(callback) {
    await this.waitForUnlock(); // 等待锁释放
    this.saveProjectSyncInfoToJson(this.rootPath).then((res) => {
      this.syncFolderToYMap(this.rootPath); // 保存项目信息
      callback && callback();
    });
  }

  // Yjs Map 观察者处理函数
  async yMapObserveHandler(editor, event) {
    event.keysChanged.forEach(async (key) => {
      const content = this.yMap.get(key);
      try {
        console.log("YMap event:", event); // 打印事件对象
        const dirpath = path.dirname(key);
        await FS.ensureDir(dirpath);
        if (this.isCurrentFile(editor, key)) {
          this.setEditorContent(content);
        } else {
          const fileStore = useFileStore.getState();
          await fileStore.saveFile(key, content, false, false);
        }

        const allFilesSynced = Array.from(this.yMap.keys()).every((key) => {
          return FS.existsPath(key);
        });
        if (allFilesSynced && this.isExistAllFile == false) {
          this.otherOperation && this.otherOperation();
          this.isExistAllFile = true;
        }
      } catch (err) {
        console.error(err);
      } finally {
      }
    });
  }

  // Awareness 变化处理函数
  awarenessChangeHandler({ added, updated, removed }) {
    this.userList = this.getCurrentUsers();
    // console.log("Users added:", added.map(id => states.get(id)));
    // console.log("Users updated:", updated.map(id => states.get(id)));
    // console.log("Users removed:", removed.map(id => states.get(id)));
    console.log(this.userList, "users added");
  }

  // 获取当前在线用户信息
  getCurrentUsers() {
    const states = this.awareness.getStates();
    const users = [];
    states.forEach((state, clientID) => {
      console.log(state, clientID, "state.user");
      users.push({ clientID, ...state.user });
    });
    return users;
  }

  // 清理函数
  cleanup() {
    if (this.yMap && this.yMapObserveHandler) {
      this.yMap.unobserve(this.yMapObserveHandler);
    }

    if (this.awareness && this.awarenessChangeHandler) {
      this.awareness.off("change", this.awarenessChangeHandler);
    }
    // 清理本地用户状态
    if (this.awareness) {
      this.awareness.setLocalState(null);
    }

    // 销毁 AceBinding
    if (this.aceBinding) {
      // this.aceBinding.destroy();
    }
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
  }
}

export { ProjectSync };
