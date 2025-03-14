import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
// const wsUrl = `ws://localhost:1234`;
const wsUrl = `ws://network.jancsitech.net:5913`;

class snapshotSync {
    constructor(projectRoot, userId, token) {
        this.yDoc = new Y.Doc();
        this.roomId = projectRoot + userId;
        this.dbName = `snap-${projectRoot}`;
        this.snapshotSpace = `snapshot_${projectRoot}_${userId}`;
        this.storeSpace = projectRoot + userId;
        this.idbPersistence = new IndexeddbPersistence(this.dbName, this.yDoc);
        this.websocketProvider = new WebsocketProvider(
              wsUrl,
              this.roomId,
              this.yDoc,
              { params: { yauth: token } },
            );
        this.onsyncCount = 0; 
        this.storeYMap = this.yDoc.getMap(this.storeSpace);
        this.snapshotYMap = this.yDoc.getMap(this.snapshotSpace);
        this.saveSnapshot = this.saveSnapshot.bind(this);
        this.loadSnapshot = this.loadSnapshot.bind(this);
        this.deleteSnapshot = this.deleteSnapshot.bind(this);
        this.renameSnapshot = this.renameSnapshot.bind(this);
        this.getSnapshotList = this.getSnapshotList.bind(this);
        this.clearIndexedDB = this.clearIndexedDB.bind(this);
        this.websocketProvider.on("synced", () => {
            this.onsyncCount++;
            console.log("snapshotSync synced");
        })
        this.idbPersistence.on("synced", () => {
            this.onsyncCount++;
            console.log("IndexedDB synced");
        });
    }

    getStoreMap() {
        return new Promise((resolve, reject) => {
            const checkSync = () => {
                if (this.onsyncCount === 2) {
                    resolve(this.storeYMap);
                } else {
                    console.log("Waiting for sync...");
                    setTimeout(checkSync, 50);
                }
            };
            checkSync();
        });
    }
    getSnapshotMap() {
        return new Promise((resolve, reject) => {
            const checkSync = () => {
                if (this.onsyncCount === 2) {
                    resolve(this.snapshotYMap);
                } else {
                    console.log("Waiting for sync...");
                    setTimeout(checkSync, 50);
                }
            };
            checkSync();
        });
    }

    async clearIndexedDB() {
        await this.idbPersistence.destroy();
        const request = indexedDB.deleteDatabase(this.dbName);
        request.onsuccess = function() {
            console.log("Database deleted successfully");
        };
        request.onerror = function(event) {
            console.error("Database deletion failed", event.target.errorCode);
        };
        request.onblocked = function() {
            console.log("Database deletion is blocked");
        };
    }
    
    async saveSnapshot({ yDoc, snapshotName, creationTime, snapshotId }) {
        const snapshotUpdate = Y.encodeStateAsUpdate(yDoc);
        this.yDoc.transact(async () => {
            const yMap = await this.getSnapshotMap();
            yMap.set(snapshotId, { snapshotName, snapshotUpdate, creationTime, snapshotId });
        });
    }

    async loadSnapshot(snapshotId, originYdoc) {
        const yMap = await this.getSnapshotMap();
        const snapshotUpdate = yMap.get(snapshotId).snapshotUpdate;
        const snapshotDoc = new Y.Doc();
        Y.applyUpdate(snapshotDoc, snapshotUpdate);
        const currentStateVector = Y.encodeStateVector(originYdoc);
        const snapshotStateVector = Y.encodeStateVector(snapshotDoc);
        const changesSinceSnapshotUpdate = Y.encodeStateAsUpdate(originYdoc, snapshotStateVector);
        const undoManager = new Y.UndoManager(snapshotDoc.getMap(this.storeSpace));
        Y.applyUpdate(snapshotDoc, changesSinceSnapshotUpdate)
        undoManager.undo();
        const revertChangesSinceSnapshotUpdate = Y.encodeStateAsUpdate(snapshotDoc, currentStateVector);
        Y.applyUpdate(originYdoc, revertChangesSinceSnapshotUpdate);
        copyYtext(snapshotDoc, originYdoc, this.storeSpace);
    }

    async renameSnapshot(snapshotId, newName) {
        this.yDoc.transact(async () => {
            const yMap = await this.getSnapshotMap();
            if (yMap.has(snapshotId))  {
                yMap.set(snapshotId, { ...yMap.get(snapshotId), snapshotName: newName });
            }
        });
    }
    async deleteSnapshot(snapshotId) {
        this.yDoc.transact(async () => {
            const yMap = await this.getSnapshotMap();
            if (yMap.has(snapshotId))  {
                yMap.delete(snapshotId);
            }
        });
    }

    async getSnapshotList() {
        const yMap = await this.getSnapshotMap();
        const snapshotList = [];
        yMap.forEach((value, key) => {
            snapshotList.push({
                id: value.snapshotId,
                name: value.snapshotName,
                creationTime: value.creationTime,
            });
        });
        return snapshotList;
    }
}


const copyYMap = (sourceMap, targetMap) => {
    const stack = [];
    stack.push({ source: sourceMap, target: targetMap });
    while (stack.length > 0) {
        const { source, target } = stack.pop();
        source.forEach((value, key) => {
            if (value instanceof Y.Map) {
                const newMap = new Y.Map();
                target.set(key, newMap);
                stack.push({ source: value, target: newMap });
            } else if (value instanceof Y.Text) {
                const newText = new Y.Text();
                newText.insert(0, value.toString());
                target.set(key, newText);
            } else {
                target.set(key, value);
            }
        });
    }
};

const copyYtext = (sourceYDoc, targetYDoc, namespace) => {
    const ymap = sourceYDoc.getMap(namespace)
    ymap.forEach((value, key) => {
        const ytext = targetYDoc.getText(key);
        ytext.delete(0, ytext.length);
        ytext.insert(0, value.toString());
    })
};
const printYMap = async (yMap) => {
    try {
        await waitForSync(yMap);
        yMap.forEach((value, key) => {
            console.log(key, value, "key-value");
        })
        const keys = Array.from(yMap.keys());
        console.log(keys, "keys after sync");
    } catch (error) {
        console.error("Error in syncing:", error);
    }
};
const waitForSync = (yMap) => {
    return new Promise((resolve, reject) => {
        const observer = (event) => {
            console.log("Data change observed in yMap:", event);
            resolve();
        };
        yMap.observe(observer);

        setTimeout(() => {
            reject("Timeout waiting for sync");
        }, 5000);
    });
};

export { snapshotSync };