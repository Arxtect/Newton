/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-11-14 12:44:40
 */
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useFileStore } from "@/store"; // 假设 Zustand 文件操作在这里定义
import path from "path";
import * as FS from "domain/filesystem";
import { AceBinding } from "./ace-binding"; // 导入AceBinding
import {
  uploadFile,
  downloadFile,
  uploadFileBinary,
  downloadFileBinary,
} from "./minio";
import { assetExtensions } from "@/constant";
import { debounce, getColors } from "@/util";
import { toast } from "react-toastify";
import { LatexSyncToYText } from "./latexSyncToYText";

const host = window.location.hostname;
const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `wss://arxtect.com/websockets/`;
// const wsUrl = `ws://3.227.9.181:8013`;
// const wsUrl = `ws://206.190.239.91:9008/`;
// const wsUrl = `ws://10.10.99.42:8013/`;

class ProjectSync {
  constructor(
    rootPath,
    user,
    roomId,
    token,
    position,
    otherOperation,
    isLeave = false,
    parentDir = "."
  ) {
    this.folderMapName = `${rootPath}_folder_map_list_${roomId}`;
    this.rootPath = rootPath;
    this.parentDir = parentDir;
    this.currenProjectDir = path.join(this.parentDir, rootPath);
    this.roomId = roomId;
    this.yDoc = new Y.Doc();

    this.websocketProvider = new WebsocketProvider(
      wsUrl,
      this.rootPath + this.roomId,
      this.yDoc,
      { params: { yauth: token } }
    );
    this.user = user;
    this.userList = [];
    this.awareness = this.websocketProvider.awareness;
    this.currentFilePath = "";
    this.latexSyncToYText = null;
    this.initialized = false;
    this.isInitialSyncComplete = false; // 初始化标志
    this.isLeave = isLeave;
    // 设置用户信息

    // 使用 rootPath 作为命名空间
    this.yMap = this.yDoc.getMap(this.rootPath + this.roomId);

    this.otherOperation = otherOperation && otherOperation; // 保存回调函数
    this.isExistAllFile = false;

    // 保存当前的观察者句柄
    this.currentObserver = null;
    this.setUserAwareness({ ...this.user, color: getColors(position) });

    this.setObserveHandler = () => {
      // 清理旧的观察者
      if (this.currentObserver) {
        this.yMap.unobserve(this.yMapObserveHandler.bind(this));
      }
      // 设置新的观察者
      this.currentObserver = true;
      this.yMap.observe(this.yMapObserveHandler.bind(this));
    };

    this.saveState = {
      updateEditorAndCurrentFilePath:
        this.updateEditorAndCurrentFilePath.bind(this),
      updateCurrentFilePathYText: this.updateCurrentFilePathYText.bind(this),
      syncFileToYMap: this.syncFileToYMap.bind(this),
      deleteFile: this.deleteFile.bind(this),
      deleteFolder: this.deleteFolder.bind(this),
      leaveCollaboration: this.leaveCollaboration.bind(this),
      setObserveHandler: this.setObserveHandler.bind(this),
      isInitialSyncComplete: this.isInitialSyncComplete,
      syncFolderToYMapRootPath: this.syncFolderToYMapRootPath.bind(this),
      changeIsInitialSyncComplete: this.changeIsInitialSyncComplete.bind(this),
      changeInitial: this.changeInitial.bind(this),
    };
  }

  changeIsInitialSyncComplete() {
    this.isInitialSyncComplete = true;
  }

  async removeProjectSyncInfo() {
    await FS.removeProjectInfo(this.currenProjectDir);
  }

  // 设置用户信息到 awareness
  setUserAwareness(user) {
    this.awareness.setLocalStateField("user", user);
  }

  setEditorContent(content) {
    const handleChange = useFileStore.getState().changeValue;
    handleChange(content, false);
  }

  isCurrentFile(filePath) {
    return this.currentFilePath && filePath == this.currentFilePath;
  }

  changeInitial() {
    this.initialized = true;
  }

  updateCurrentFilePathYText(filePath, editor) {
    let latexSyncToYText = new LatexSyncToYText(
      this.yText,
      filePath,
      editor,
      this.changeInitial.bind(this),
      this.initialized
    );
    this.latexSyncToYText = latexSyncToYText.destroy.bind(latexSyncToYText);
  }

  updateEditorAndCurrentFilePath(filePath, editor) {
    if (this.latexSyncToYText != null) {
      this.latexSyncToYText(); // 取消之前的监听
      this.latexSyncToYText = null;
    }

    const relativePath = FS.removeParentDirPath(filePath, this.parentDir);
    this.currentFilePath = relativePath;
    this.yText = this.yDoc.getText(relativePath);
    this.undoManager = new Y.UndoManager(this.yText);
    const ext = path.extname(relativePath).slice(1).toLowerCase(); // 获取文件扩展名并转换为小写

    if (assetExtensions.includes(ext)) {
      return;
    }
    if (this.aceBinding) {
      this.aceBinding.updateCurrentFilePath(relativePath, editor);
    } else {
      this.aceBinding = new AceBinding(this.awareness);
      this.aceBinding.init(editor, relativePath); // 初始化 AceBinding 实例
    }
    this.aceBinding?.handleAwarenessChange &&
      this.aceBinding.handleAwarenessChange(editor);
  }

  //同步文件内容到 Yjs Map
  async syncToYMap(filePath, content) {
    const ext = path.extname(filePath).slice(1).toLowerCase(); // 获取文件扩展名并转换为小写
    let contentToStore = content;
    if (assetExtensions.includes(ext)) {
      // 如果是资产文件类型，则转换为 Base64 编码
      try {
        contentToStore = await uploadFile(filePath, content);
        // contentToStore = uploadFileBinary(filePath, content);
      } catch (err) {
        // contentToStore = content.toString();
        console.log(err.message, "err.message");
        toast.error(err.message);
      }
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
          const relativePath = FS.removeParentDirPath(filePath, this.parentDir);
          await this.deleteFile(relativePath); // 删除文件
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
    if (filePath.includes(".git")) return;
    try {
      const relativePath = FS.removeParentDirPath(filePath, this.parentDir);
      await this.syncToYMap(relativePath, content);
      // if (this.yMap.has(relativePath)) return;
      const folderPath = path.dirname(relativePath);

      this.syncFolderInfo(folderPath);
    } catch (err) {
      console.error(`Error syncing file ${filePath}:`, err);
      throw err;
    } finally {
    }
  }

  // 同步文件夹列表
  syncFolderInfo(folderPath) {
    if (folderPath.includes(".git")) return;
    this.yDoc.transact(() => {
      let folderMap = this.yMap.get(this.folderMapName) || [];

      folderMap = [...folderMap, folderPath];
      console.log(folderMap, folderPath, "folderMap");

      this.yMap.set(this.folderMapName, [...new Set(folderMap)]);
    });
  }

  // 从 Yjs Map 中删除文件夹
  removeFolderInfo(folderPath) {
    if (folderPath.includes(".git")) return;
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
    if (folderPath.includes(".git")) return;

    const syncPromises = [];

    const handlePromise = async (folderPath) => {
      this.syncFolderInfo(folderPath);
      const files = await FS.readFileStats(folderPath, false);

      for (const file of files) {
        const filePath = path.join(folderPath, file.name);

        if (file.type === "file") {
          const promise = FS.readFile(filePath).then(async (content) => {
            await this.syncToYMap(filePath, content);
          });
          syncPromises.push(promise);
        } else if (file.type === "dir") {
          await handlePromise(filePath);
        }
      }
    };

    try {
      await handlePromise(folderPath);

      await Promise.all(syncPromises);
    } catch (err) {
      console.error(`Error syncing folder ${folderPath}:`, err);
      throw err;
    }
  }

  debouncedRepoChanged = debounce(() => {
    useFileStore.getState().repoChanged();
  }, 1000);

  async syncFolderToYMapRootPath(callback) {
    await this.syncFolderToYMap(this.rootPath); // 保存项目信息

    callback && callback();
  }

  async handleFolderInfo(folderPath, key, content) {
    if (folderPath.includes(".git")) return;
    const files = await FS.readFileStats(folderPath, false);

    const fileNames = new Set(files.map((f) => f.name));
    const contentNames = new Set(content);

    // 删除 files 中有但 content 中没有的文件夹
    for (const file of files) {
      const filePath = path.join(folderPath, file.name);
      const relativePath = FS.removeParentDirPath(filePath, this.parentDir);
      if (file.name.includes(".git")) continue;

      if (file.type == "dir" && !contentNames.has(relativePath)) {
        const folderPath = path.join(this.parentDir, relativePath);
        await this.deleteFolder(folderPath);
        console.log(`Deleted folder ${filePath}`);
      }
    }

    // 创建 content 中有但 files 中没有的文件夹
    for (const folderName of contentNames) {
      const folderPath = path.join(this.parentDir, folderName);
      if (!fileNames.has(folderPath)) {
        await FS.ensureDir(folderPath);
        console.log(`Created folder ${folderPath}`);
      }
    }

    // 递归处理子文件夹
    for (const file of files) {
      const filePath = path.join(folderPath, file.name);
      const relativePath = FS.removeParentDirPath(filePath, this.parentDir);
      if (file.type == "dir" && contentNames.has(relativePath)) {
        await this.handleFolderInfo(filePath, key, content);
      }
    }
  }

  // Yjs Map 观察者处理函数
  async yMapObserveHandler(event) {
    let contentSyncedPromises = [];

    event.keysChanged.forEach((key) => {
      if (event?.transaction?.origin == null) {
        console.log(`Origin is null for key ${key}`, event?.transaction);
        return;
      }

      contentSyncedPromises.push(
        new Promise(async (resolve, reject) => {
          const content = this.yMap.get(key);
          const relativePath = path.join(this.parentDir, key);
          console.log(this.parentDir, relativePath, "this.parentDir");
          try {
            if (key == this.folderMapName) {
              await FS.ensureDir(this.currenProjectDir);

              this.handleFolderInfo(
                this.currenProjectDir,
                relativePath,
                content
              );
              resolve();
              return;
            }

            if (content?._delete) {
              // 如果内容为空，则删除文件
              await useFileStore
                .getState()
                .deleteFile({ filename: relativePath }, true);
              resolve();
              return;
            } else {
              const dirpath = path.dirname(relativePath);
              await FS.ensureDir(dirpath);
              const ext = path.extname(key).slice(1).toLowerCase();
              if (assetExtensions.includes(ext)) {
                // 如果是资产文件类型，则将 Base64 编码的字符串转换回文件数据
                await downloadFile(content, relativePath);
                resolve();
                // await downloadFileBinary(key, content);
              } else {
                if (this.isCurrentFile(key)) {
                  resolve();
                  console.log(this.initialized, "initialized");
                  // if (!this.initialized) this.setEditorContent(content);
                  // console.log(key, "content");
                } else {
                  const fileStore = useFileStore.getState();
                  // await fileStore.saveFile(key, content, false);
                  content?.length &&
                    (await fileStore.saveFile(relativePath, content, false));
                  resolve();
                }
              }
            }
          } catch (err) {
            reject(err);
            console.error(err, relativePath);
          }
        })
      );
      if (event.keysChanged.size == contentSyncedPromises.length) {
        Promise.all(contentSyncedPromises).then(() => {
          this.otherOperation && this.otherOperation();
          contentSyncedPromises = [];
          this.debouncedRepoChanged();
          if (this.isLeave) {
            this.leaveCollaboration();
          }
          if (!this.isInitialSyncComplete) {
            this.isInitialSyncComplete = true; // 标记初始同步完成
            this.changeInitial();
          }
        });
      }
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
