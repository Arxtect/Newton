import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useFileStore } from "@/store"; // 假设 Zustand 文件操作在这里定义
import path from "path";
import * as FS from "domain/filesystem";
import { AceBinding } from "./ace-binding"; // 导入AceBinding
import { uploadFile, downloadFile } from "./minio";
import { assetExtensions } from "@/util";
import { debounce } from "@/util";
import { Awareness } from "y-protocols/awareness.js"; // eslint-disable-line
import {getColors} from "@/util";

const host = window.location.hostname;
const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `wss://arxtect.com/websockets`;
// const wsUrl = `ws://10.10.101.126:8013`;


class ProjectSync {
  constructor(rootPath, user, roomId, token, otherOperation) {
    this.folderMapName = `${rootPath}_folder_map_list_${roomId}`;
    this.rootPath = rootPath;
    this.roomId = roomId;
    this.yDoc = new Y.Doc();
    this.websocketProvider = new WebsocketProvider(
      wsUrl,
      this.rootPath + this.roomId,
      this.yDoc,
      { params: { yauth: token } }
    );
    this.user = {
      ...user,
      color: getColors(),
    };
    this.userList = [];
    this.awareness = this.websocketProvider.awareness;
    this.currentFilePath = "";
    this.isLocalChange = true; // 是否本地变更

    // 设置用户信息
    this.setUserAwareness(this.user);

    // 使用 rootPath 作为命名空间
    this.yMap = this.yDoc.getMap(this.rootPath + this.roomId);

    this.otherOperation = otherOperation && otherOperation; // 保存回调函数
    this.isExistAllFile = false;

    // 保存当前的观察者句柄
    this.currentObserver = null;
    this.awareness.on("change", this.getUserList.bind(this));
  }

  getUserList({ added, removed, updated }) {
    const states = /** @type {Awareness} */ (this.awareness).getStates();

    // 初始化一个 Set 来存储唯一的用户
    let uniqueUsers = [];
    let currentUsersId = [];

    for (let [id, state] of states) {
      console.log(state, "state"); // 输出每个 state 对象
      if (state && state.user) {
        if (!currentUsersId.includes(state.user.id)) {
          currentUsersId.push(state.user.id);
          uniqueUsers.push(state.user); // 使用 JSON 字符串来确保对象的唯一性
        }
      }
    }

    // 将 Set 转换为数组，并解析 JSON 字符串回对象
    this.userList = uniqueUsers;

    // 输出最终的用户列表
    console.log("User List:", this.userList);
  }

  // set observe handler
  setObserveHandler(editor = "default-editor") {
    // 清理旧的观察者
    if (this.currentObserver) {
      this.yMap.unobserve(this.currentObserver);
    }

    // 设置新的观察者
    this.currentObserver = this.yMapObserveHandler.bind(this, editor);
    this.yMap.observe(this.currentObserver);
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
  setEditorContent(content) {
    const handleChange = useFileStore.getState().changeValue;
    handleChange(content, false);
  }

  isCurrentFile(editor, filePath) {
    return (
      editor != null && this.currentFilePath && filePath == this.currentFilePath
    );
  }

  updateEditorAndCurrentFilePath(filePath, editor) {
    this.currentFilePath = filePath;
    this.yText = this.yDoc.getText(filePath);
    console.log(this.yText, "this.yText");
    this.undoManager = new Y.UndoManager(this.yText);
    this.setObserveHandler(editor);

    if (this.aceBinding) {
      this.aceBinding.updateCurrentFilePath(filePath, editor);
    } else {
      this.aceBinding = new AceBinding(this.awareness);
      this.aceBinding.init(editor, filePath); // 初始化 AceBinding 实例
    }
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

  //同步文件内容到 Yjs Map
  async syncToYMap(filePath, content) {
    const ext = path.extname(filePath).slice(1).toLowerCase(); // 获取文件扩展名并转换为小写
    let contentToStore = content;
    if (assetExtensions.includes(ext)) {
      // 如果是资产文件类型，则转换为 Base64 编码
      contentToStore = await uploadFile(filePath, content);
    } else {
      // 否则将内容转换为字符串
      contentToStore = content.toString();
    }

    this.yDoc.transact(() => {
      this.yMap.set(filePath, contentToStore);
    });
  }
  // 删除文件
  async deleteFile(filePath, otherInfo = {}) {
    this.yDoc.transact(() => {
      this.yMap.set(filePath, { _delete: true, ...otherInfo });
    });
  }
  // 删除文件夹
  async deleteFolder(folderPath) {
    try {
      if (!(await FS.existsPath(folderPath))) return;
      const files = await FS.readFileStats(folderPath, false);
      this.removeFolderInfo(folderPath);

      for (const file of files) {
        const filePath = path.join(folderPath, file.name); // 使用 path.join 进行路径拼接

        if (file.type == "file") {
          await this.deleteFile(filePath, { dir: folderPath }); // 删除文件
        } else if (file.type == "dir") {
          await this.deleteFolder(filePath); // 递归删除子文件夹
        }
      }
      await FS.removeDir(folderPath);
    } catch (err) {
      console.error(`Error deleting folder ${folderPath}:`, err);
      // throw err;
    }
  }

  // 同步单个文件到 Yjs Map
  async syncFileToYMap(filePath, content) {
    try {
      await this.syncToYMap(filePath, content);
      const folderPath = path.dirname(filePath);
      this.syncFolderInfo(folderPath);
    } catch (err) {
      console.error(`Error syncing file ${filePath}:`, err);
      throw err;
    } finally {
    }
  }

  // 同步文件夹列表
  syncFolderInfo(folderPath) {
    console.log(folderPath, "folderPath");
    this.yDoc.transact(() => {
      let folderMap = this.yMap.get(this.folderMapName) || [];
      folderMap = [...folderMap, folderPath];
      console.log(folderMap, "folderMap");
      this.yMap.set(this.folderMapName, [...new Set(folderMap)]);
    });
  }

  // 从 Yjs Map 中删除文件夹
  removeFolderInfo(folderPath) {
    this.yDoc.transact(() => {
      let folderMap = this.yMap.get(this.folderMapName) || [];
      if (folderMap.includes(folderPath)) {
        folderMap = folderMap.filter((item) => item != folderPath);
        this.yMap.set(this.folderMapName, [...new Set(folderMap)]);
      }
    });
  }

  // 同步整个文件夹到 Yjs Map
  async syncFolderToYMap(folderPath) {
    try {
      this.syncFolderInfo(folderPath);
      const files = await FS.readFileStats(folderPath, false);

      console.log(files, "files");

      for (const file of files) {
        const filePath = path.join(folderPath, file.name); // 使用 path.join 进行路径拼接

        if (file.type == "file") {
          const content = await FS.readFile(filePath);
          await this.syncToYMap(filePath, content); // 只同步相对路径
        } else if (file.type == "dir") {
          await this.syncFolderToYMap(filePath); // 递归同步子文件夹
        }
      }
    } catch (err) {
      console.error(`Error syncing folder ${folderPath}:`, err);
      throw err;
    }
  }

  debouncedRepoChanged = debounce(() => {
    useFileStore.getState().repoChanged();
  }, 200);

  async syncFolderToYMapRootPath(callback) {
    this.saveProjectSyncInfoToJson(this.rootPath).then((res) => {
      this.syncFolderToYMap(this.rootPath); // 保存项目信息
      callback && callback();
    });
  }

  async handleFolderInfo(folderPath, key, content) {
    const files = await FS.readFileStats(folderPath, false);
    const fileNames = new Set(files.map((f) => f.name));
    const contentNames = new Set(content);

    // 删除 files 中有但 content 中没有的文件夹
    for (const file of files) {
      const filePath = path.join(folderPath, file.name);
      if (file.type == "dir" && !contentNames.has(filePath)) {
        await this.deleteFolder(filePath);
        console.log(`Deleted folder ${filePath}`);
      }
    }

    // 创建 content 中有但 files 中没有的文件夹
    for (const folderName of contentNames) {
      if (!fileNames.has(folderName)) {
        await FS.ensureDir(folderName);
        console.log(`Created folder ${folderName}`);
      }
    }

    // 递归处理子文件夹
    for (const file of files) {
      if (file.type == "dir" && contentNames.has(file.name)) {
        const filePath = path.join(folderPath, file.name);
        await this.handleFolderInfo(filePath, key, content);
      }
    }
  }

  // Yjs Map 观察者处理函数

  async yMapObserveHandler(editor, event) {
    const contentSyncedPromises = [];

    event.keysChanged.forEach((key) => {
      contentSyncedPromises.push(
        new Promise(async (resolve) => {
          const content = this.yMap.get(key);

          try {
            console.log("YMap event:", event, key); // 打印事件对象
            if (key == this.folderMapName) {
              await FS.ensureDir(this.rootPath);
              console.log(content, "content");
              this.handleFolderInfo(this.rootPath, key, content);
              resolve();
              return;
            }
            if (content?._delete || content == undefined) {
              // 如果内容为空，则删除文件
              await useFileStore.getState().deleteFile({ filename: key });
              if (!!content?.dir) {
                const files = await FS.readFileStats(content?.dir, false);
                if (files.length == 0) {
                  useFileStore
                    .getState()
                    .deleteDirectory({ dirpath: content.dir });
                }
              }
              console.log(`File ${key} deleted successfully.`);
              resolve();
              return;
            } else {
              const dirpath = path.dirname(key);
              await FS.ensureDir(dirpath);
              const ext = path.extname(key).slice(1).toLowerCase();
              if (assetExtensions.includes(ext)) {
                // 如果是资产文件类型，则将 Base64 编码的字符串转换回文件数据
                const fileData = await downloadFile(content, key);
                console.log(content, "content");
                // await FS.writeFile(key, Buffer.from(fileData));
              } else {
                if (this.isCurrentFile(editor, key)) {
                  this.setEditorContent(content);
                } else {
                  const fileStore = useFileStore.getState();
                  await fileStore.saveFile(key, content, false, false);
                }
              }
            }
          } catch (err) {
            console.error(err, key);
          } finally {
            // 调用需要防抖处理的函数
            this.debouncedRepoChanged();
            // 等待所有内容同步完成后再进行光标同步
            Promise.all(contentSyncedPromises).then(() => {
              this.otherOperation && this.otherOperation();
              this.aceBinding?.handleAwarenessChange &&
                this.aceBinding.handleAwarenessChange(editor);
            });
            resolve(); // 同步完成后，Promise 解决
          }
        })
      );
    });
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
    if (this.yMap && this.currentObserver) {
      this.yMap.unobserve(this.currentObserver);
    }

    // 清理本地用户状态
    if (this.awareness) {
      this.awareness.setLocalState(null);
    }

    // 销毁 AceBinding
    if (this.aceBinding) {
      this.aceBinding.destroy();
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
