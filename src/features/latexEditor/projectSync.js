import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { useFileStore } from "./useFileStore"; // 假设 Zustand 文件操作在这里定义
import path from "path"

class FileSync {
    constructor(rootPath, yDoc, awareness, handleChange) {
        this.rootPath = rootPath;
        this.yDoc = yDoc;
        this.awareness = awareness;
        this.handleChange = handleChange;

        // 初始化 Yjs
        this.yMap = this.yDoc.getMap("fileTree");
        this.yMap.observe(this.yMapObserveHandler.bind(this));
    }

    // 读取文件内容
    async readFile(filePath) {
        try {
            const fileStore = useFileStore.getState();
            const data = await fileStore.loadFile({ filepath: this.rootPath + filePath });
            return data;
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    // 写入文件内容
    async writeFile(filePath, content) {
        try {
            const fileStore = useFileStore.getState();
            await fileStore.saveFile(this.rootPath + filePath, content);
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
            await fileStore.deleteFile({ filename: this.rootPath + filePath });
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
            await fileStore.createDirectory({ dirname: this.rootPath + folderPath });
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    // 读取文件树   ---  fileStore未实现
    async readFolder(folderPath) {
        try {
            const fileStore = useFileStore.getState();
            const files = await fileStore.readFolder(this.rootPath + folderPath);
            return files;
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
            const fullPath = this.rootPath + (folderPath || ""); // 处理根路径
            const files = await this.readFolder(fullPath);

            for (const file of files) {
                const filePath = path.join(fullPath, file); // 使用 path.join 进行路径拼接
                const stats = await FS.stat(filePath);

                if (stats.isFile()) {
                    const content = await this.readFile(filePath);
                    this.syncToYMap(filePath.substring(this.rootPath.length), content); // 只同步相对路径
                } else if (stats.isDirectory()) {
                    await this.syncFolderToYMap(filePath.substring(this.rootPath.length)); // 递归同步子文件夹
                }
            }
        } catch (err) {
            console.error(`Error syncing folder ${folderPath}:`, err);
            throw err;
        }
    }
    // Yjs Map 观察者处理函数
    yMapObserveHandler(event) {
        event.keysChanged.forEach(async (key) => {
            const content = this.yMap.get(key);
            try {
                const fileStore = useFileStore.getState();
                await fileStore.saveFile(this.rootPath + key, content);
                this.handleChange(key, content);
            } catch (err) {
                console.error(err);
            }
        });
    }

    // 清理函数
    cleanup() {
        this.yMap.unobserve(this.yMapObserveHandler);
    }
}

export default FileSync;
