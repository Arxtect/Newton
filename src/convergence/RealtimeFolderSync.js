import { Convergence } from '@convergence/convergence';
import { readDirectoryTree, writeDirectoryTree } from '@/domain/filesystem'


class RealtimeFolderSync {
    constructor(domainUrl, collectionId, userId, rootPath) {
        this.domainUrl = domainUrl;
        this.collectionId = collectionId;
        this.userId = String(userId);
        this.rootPath = rootPath;
        this.domain = null;
        this.folderModel = null;
        this.fileModels = new Map();
        this.cursorModels = new Map();
        this.presence = null;
        this.websocket = null;
        this.folderSync = null;
    }

    async initFolderSync() {
        const { default: FolderSync } = await import('./FolderSync.js');
        this.folderSync = new FolderSync(this.rootPath);
    }

    async connect() {
        try {
            await this.initFolderSync();
            this.domain = await Convergence.connectAnonymously(this.domainUrl);
            this.presence = this.domain.presence(this.collectionId);
            this.presence.events().subscribe((event) => {
                console.log(event, 'event');
                if (event.joined) {
                    console.log("用户加入:", event.user.userId);
                } else if (event.left) {
                    console.log("用户离开:", event.user.userId);
                }
            });
            // this.presence.subscribe((users) => {
            //     // onJoin: this.updateUserCount.bind(this),
            //     // onLeave: this.updateUserCount.bind(this),
            //     // onUserStatus: this.updateUserCount.bind(this)
            //     console.log(users, 'users')
            // });

            this.folderModel = await this.domain.models().openAutoCreate({
                collection: this.collectionId,
                id: 'folder',
                data: { files: [] }
            });

            this.folderModel.elementAt('files').on('insert', this.handleFileInsert.bind(this));
            this.folderModel.elementAt('files').on('remove', this.handleFileRemove.bind(this));

            // Connect to Convergence WebSocket
            // const websocketUrl = this.domainUrl.replace(/^http/, 'ws');
            // this.websocket = await Convergence.connectWebSocket(websocketUrl);
            // this.websocket.authenticateAsAnonymous();
            // this.websocket.joinCollection(this.collectionId);

            // this.websocket.onMessages((msg) => {
            //     const action = msg.data.action;
            //     const fileName = msg.data.fileName;
            //     const content = msg.data.content;
            //     switch (action) {
            //         case 'createFile':
            //             this.createFile(fileName, content);
            //             break;
            //         case 'deleteFile':
            //             this.deleteFile(fileName);
            //             break;
            //         case 'editFile':
            //             this.editFile(fileName, content);
            //             break;
            //         case 'syncFolder':
            //             this.syncFolder(content);
            //             break;
            //         default:
            //             console.error('Unknown action:', action);
            //     }
            // });
        } catch (error) {
            console.error('Error connecting to Convergence:', error);
        }
    }

    async createFile(fileName, content = '') {
        try {
            const fileModel = await this.domain.models().openAutoCreate({
                collection: this.collectionId,
                id: fileName,
                data: { content, cursors: {} }
            });
            this.fileModels.set(fileName, fileModel);
            this.folderModel.elementAt('files').insert(fileName);
        } catch (error) {
            console.error('Error creating file:', error);
        }
    }

    async deleteFile(fileName) {
        try {
            const fileModel = this.fileModels.get(fileName);
            if (fileModel) {
                await fileModel.delete();
                this.fileModels.delete(fileName);
                this.folderModel.elementAt('files').remove(fileName);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }

    async editFile(fileName, newContent) {
        try {
            const fileModel = this.fileModels.get(fileName);
            if (fileModel) {
                await fileModel.elementAt('content').value(newContent);
            }
        } catch (error) {
            console.error('Error editing file:', error);
        }
    }

    async updateCursorPosition(fileName, position) {
        try {
            const fileModel = this.fileModels.get(fileName);
            if (fileModel) {
                await fileModel.elementAt('cursors').set(this.userId, position);
            }
        } catch (error) {
            console.error('Error updating cursor position:', error);
        }
    }

    handleFileInsert(file) {
        if (!this.fileModels.has(file)) {
            const fileModel = this.domain.models().get(`${this.collectionId}.${file}`);
            fileModel.elementAt('cursors').set(this.userId, { row: 0, column: 0 });
            fileModel.elementAt('cursors').on('insert', this.handleCursorInsert.bind(this, file));
            fileModel.elementAt('cursors').on('remove', this.handleCursorRemove.bind(this, file));
            this.fileModels.set(file, fileModel);
        }
    }

    handleFileRemove(file) {
        if (this.fileModels.has(file)) {
            this.fileModels.delete(file);
        }
    }

    handleCursorInsert(file, userId, position) {
        if (userId !== this.userId) {
            if (!this.cursorModels.has(userId)) {
                this.cursorModels.set(userId, new Map());
            }
            this.cursorModels.get(userId).set(file, position);
        }
    }

    handleCursorRemove(file, userId) {
        if (this.cursorModels.has(userId)) {
            this.cursorModels.get(userId).delete(file);
        }
    }

    async updateUserCount() {
        try {
            const userCount = this.presence.count();
            // 将 userCount 发送到你需要的地方更新用户数量
            console.log('Users online:', userCount);
        } catch (error) {
            console.error('Error updating user count:', error);
        }
    }

    async syncFolder(tree) {
        try {
            await this.folderSync.writeDirectoryTree(this.rootPath, tree);
            console.log('Folder synced successfully.');
        } catch (error) {
            console.error('Error syncing folder:', error);
        }
    }
}

class CollaborationSync {
    constructor(domainUrl, collectionId, userId, rootPath) {
        this.realtimeFolderSync = new RealtimeFolderSync(domainUrl, collectionId, userId, rootPath);
    }

    async connect() {
        try {
            await this.realtimeFolderSync.connect();
            console.log('Connected to collaboration server.');
        } catch (error) {
            console.error('Error connecting to collaboration server:', error);
        }
    }

    async syncLocalFolderToCollaborators() {
        try {
            const localTree = await this.realtimeFolderSync.folderSync.readDirectoryTree(this.realtimeFolderSync.rootPath);
            await this.realtimeFolderSync.syncFolder(localTree);
            console.log('Local folder synced to collaborators successfully.');
        } catch (error) {
            console.error('Error syncing local folder to collaborators:', error);
        }
    }
}

class FolderSync {
    constructor(rootPath) {
        this.rootPath = rootPath;
    }

    async readDirectoryTree() {
        try {
            return await readDirectoryTree(this.rootPath);
        } catch (error) {
            console.error('Error reading directory tree:', error);
            return null;
        }
    }

    async writeDirectoryTree(tree) {
        try {
            await writeDirectoryTree(this.rootPath, tree);
            console.log('Directory tree synced successfully.');
        } catch (error) {
            console.error('Error writing directory tree:', error);
        }
    }
}

export {
    RealtimeFolderSync,
    CollaborationSync,
    FolderSync
}
