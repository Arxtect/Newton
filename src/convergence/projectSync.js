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
import { debounce, getColors } from "@/utils";
import { toast } from "react-toastify";
import { LatexSyncToYText, YTextManager } from "./latexSyncToYText";

const host = window.location.hostname;
const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
// const wsUrl = `wss://arxtect.com/websockets/`;
// const wsUrl = `ws://3.227.9.181:8013`;
// const wsUrl = `ws://206.190.239.91:9008/`;
// const wsUrl = `ws://10.10.99.42:8013/`;
const wsUrl = `ws://localhost:8013/`;
// const wsUrl = `ws://10.10.101.159:8013/`;

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

    // 使用 rootPath 作为命名空间
    this.yMap = this.yDoc.getMap(this.rootPath + this.roomId);

    this.otherOperation = otherOperation && otherOperation; // 保存回调函数
    this.isExistAllFile = false;
    this.YTextManager = new YTextManager(this.yDoc);

    // 保存当前的观察者句柄
    this.currentObserver = null;
    this.setUserAwareness({ ...this.user, color: getColors(position) });

    this.setObserveHandler = () => {
      console.log("Setting observe handler", this.yMap);
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
      syncFileTree: this.syncFileTree.bind(this),
      cleanup: this.cleanup.bind(this),
    };

    this.websocketProvider.on("status", (event) => {
      console.log(event, "event22");
      if (event.status === "connected") {
      }
    });

    this.websocketProvider.on("close", () => {
      this.setUserAwareness(null);
    });

    this.websocketProvider.on("synced", async () => {});
  }

  changeIsInitialSyncComplete() {
    this.isInitialSyncComplete = true;
  }

  async removeProjectSyncInfo() {
    await FS.removeProjectInfo(this.currenProjectDir);
  }

  // 设置用户信息到 awareness
  setUserAwareness(user) {
    if (user == null) {
      this.awareness.setLocalState(null);
      return;
    }
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
    this.yText = this.YTextManager.getYText(relativePath);

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
      let YText = this.yDoc.getText(filePath);
      let typeLength = YText?.toString().length;

      if (typeLength === 0) {
        YText.insert(0, contentToStore);
      }
      this.YTextManager.setYText(filePath);
    });
  }

  // 删除YMap文件
  async deleteFile(filePath, otherInfo = {}) {
    this.yDoc.transact(() => {
      const relativePath = FS.removeParentDirPath(filePath, this.parentDir);
      console.log(`yMap deleting file ${relativePath}`);
      this.yMap.set(relativePath, { _delete: true, ...otherInfo });
      // this.yMap.delete(filePath);
    });
  }

  // 删除文件夹
  async deleteFolder(folderPath) {
    try {
      if (!(await FS.existsPath(folderPath))) return;
      const deleteFolderHandler = async (folderPath) => {
        const files = await FS.readFileStats(folderPath, false);
        console.log(files, folderPath, "files");

        for (const file of files) {
          const filePath = path.join(this.parentDir, folderPath, file.name); // 使用 path.join 进行路径拼接
          console.log(filePath, "filePath");
          if (file.type == "file") {
            await this.deleteFile(filePath); // 删除文件
          } else if (file.type == "dir") {
            await deleteFolderHandler(filePath); // 递归删除子文件夹
          }
        }
      };
      await deleteFolderHandler(folderPath);
      await FS.removeDirectory(folderPath);
      await this.syncFileTree();
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
    } catch (err) {
      console.error(`Error syncing file ${filePath}:`, err);
      throw err;
    } finally {
    }
  }

  // 同步文件树到 Yjs Map
  syncTreeToYMap(fileTree) {
    this.yDoc.transact(() => {
      console.log(fileTree, "fileTree2");
      this.yMap.set(this.folderMapName, fileTree);
    });
  }

  async syncFileTree() {
    let fileTree = await FS.readFileTree(
      this.currenProjectDir,
      false,
      this.parentDir
    );
    this.syncTreeToYMap(fileTree);
    return fileTree;
  }

  // 同步整个文件夹到 Yjs Map
  async syncFolderToYMap() {
    let fileTree = await this.syncFileTree();

    console.log(fileTree, "fileTree");

    const syncPromises = [];

    const handlePromise = async (fileTree) => {
      for (const file of fileTree) {
        const filePath = path.join(this.parentDir, file.filepath);

        const promise = FS.readFile(filePath).then(async (content) => {
          await this.syncToYMap(filePath, content);
          syncPromises.push(promise);
        });
        if (file.children) {
          await handlePromise(file.children);
        }
      }
    };

    try {
      await handlePromise(fileTree);
      await Promise.all(syncPromises);
    } catch (err) {
      console.error(`Error syncing folder ${this.currenProjectDir}:`, err);
      throw err;
    }
  }

  debouncedRepoChanged = debounce(() => {
    useFileStore.getState().repoChanged();
  }, 1000);

  async syncFolderToYMapRootPath(callback) {
    await this.syncFolderToYMap(); // 保存项目信息
    callback && callback();
  }

  async handleFolderInfo(folderPath, content) {
    let folderList = content.map((item) => {
      if (item.children) {
        return path.join(this.parentDir, item.filepath);
      }
    });

    console.log(content, folderList, "fileTree22");

    // 创建本地没有的文件树
    const createFolder = async (tree) => {
      for (const file of tree) {
        if (!file.children) continue;
        const filePath = path.join(this.parentDir, file.filepath);
        let isExistPath = await FS.existsPath(filePath);
        if (!isExistPath) {
          await FS.ensureDir(filePath);
        }
        createFolder(file.children);
      }
    };
    await createFolder(content);
    const files = await FS.readFileTree(folderPath, false, this.parentDir);
    // 删除本地多余的文件树
    const deleteFolder = async (files) => {
      for (const file of files) {
        if (!file.children) continue;
        const filePath = file.filepath;
        const folderPath = path.join(this.parentDir, file.filepath);

        if (!folderList.includes(folderPath)) {
          await this.deleteFolder(folderPath);
          console.log(`Deleted folder ${filePath}`);
        } else {
          deleteFolder(file.children);
        }
      }
    };
    await deleteFolder(files);
  }

  // Yjs Map 观察者处理函数
  async yMapObserveHandler(event) {
    let contentSyncedPromises = [];

    console.log(event, "event");

    event.keysChanged.forEach(async (key) => {
      if (event?.transaction?.origin == null) {
        console.log(`Origin is null for key ${key}`, event?.transaction);
        this.isInitialSyncComplete = true; // 标记初始同步完成
        this.changeInitial();
        return;
      }
      const change = event.changes.keys.get(key);
      console.log(change?.action, key, "change.action");
      console.log(this.yMap, this.yMap.keys(), "yMap");

      contentSyncedPromises.push(
        new Promise(async (resolve, reject) => {
          const content = this.yMap.get(key);
          const relativePath = path.join(this.parentDir, key);
          this.YTextManager.setYText(relativePath);
          console.log(content, key, "content");
          try {
            // if (change?.action === "delete" || !change?.action) {
            //   console.log(`Key deleted: ${key}`);
            //   const relativePath = path.join(this.parentDir, key);
            //   await useFileStore
            //     .getState()
            //     .deleteFile({ filename: relativePath }, true);
            //   resolve();
            //   return;
            // }
            if (key == this.folderMapName) {
              await FS.ensureDir(this.currenProjectDir);
              this.handleFolderInfo(this.currenProjectDir, content);
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

      // 非project不等待
      if (!this.isLeave) {
        this.isInitialSyncComplete = true; // 标记初始同步完成
        this.changeInitial();
      }
      console.log(contentSyncedPromises, "contentSyncedPromises");
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

class ProjectSyncDownload {
  constructor(
    rootPath,
    roomId,
    token,
    otherOperation,
    parentDir = ".",
    download = false
  ) {
    this.folderMapName = `${rootPath}_folder_map_list_${roomId}`;
    this.rootPath = rootPath;
    this.parentDir = parentDir;
    this.currenProjectDir = path.join(this.parentDir, rootPath);
    this.roomId = roomId;
    this.yDoc = new Y.Doc();
    this.download = download;

    this.websocketProvider = new WebsocketProvider(
      wsUrl,
      this.rootPath + this.roomId,
      this.yDoc,
      { params: { yauth: token } }
    );

    // 使用 rootPath 作为命名空间
    this.yMap = this.yDoc.getMap(this.rootPath + this.roomId);

    this.otherOperation = otherOperation && otherOperation; // 保存回调函数

    this.websocketProvider.on("synced", async () => {
      if (this.download) {
        await FS.ensureDir(this.currenProjectDir);
        await this.downloadAllFile();
        this.leaveCollaboration();
        this.otherOperation && this.otherOperation();
      }
    });
  }

  // download all file into local
  async downloadAllFile() {
    let fileTree = this.yMap.get(this.folderMapName);
    let folderList = fileTree.map((item) => {
      if (item.children) {
        return path.join(this.parentDir, item.filepath);
      }
    });

    console.log(folderList, "fileTree22");

    // 创建本地没有的文件树
    const createFolder = async (tree) => {
      for (const file of tree) {
        const filePath = path.join(this.parentDir, file.filepath);
        if (!file.children) {
          const content = this.yMap.get(file.filepath);
          if (content?._delete) {
            continue;
          }

          console.log(content, file.filepath, "downloadAllFile");
          await FS.writeFile(filePath, content ?? "");
          continue;
        }

        let isExistPath = await FS.existsPath(filePath);
        if (!isExistPath) {
          await FS.ensureDir(filePath);
        }
        createFolder(file.children);
      }
    };
    await createFolder(fileTree);
  }

  // 离开协作进程
  leaveCollaboration() {
    // 断开 WebSocket 连接
    if (this.websocketProvider) {
      this.websocketProvider.disconnect();
    }
  }
}

export { ProjectSync, ProjectSyncDownload };
