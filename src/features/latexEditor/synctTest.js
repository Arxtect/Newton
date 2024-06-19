import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import FileSync from "./FileSync";


const host = "206.190.239.91:9008";
const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `${wsProtocol}//${host}/websockets`;
// const wsUrl = "wss://arxtect.com/websockets"

// 创建 Y.Doc 实例
const yDoc = new Y.Doc();
const provider = new WebsocketProvider(wsUrl, "file-sync", yDoc);
const awareness = provider.awareness;

// 创建 FileSync 实例
const fileSync = new FileSync("/example", yDoc, awareness, (filePath, content) => {
    console.log("File changed:", filePath, content);
});

// 同步整个文件夹
fileSync.syncFolderToYMap("");

// 使用 FileSync 实例
async function testFileSync() {
    try {
        await fileSync.writeFile("/test.txt", "Hello, world!");
        const content = await fileSync.readFile("/test.txt");
        console.log(content);
    } catch (err) {
        console.error(err);
    }
}

testFileSync();
