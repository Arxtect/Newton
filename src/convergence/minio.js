import AWS from 'aws-sdk';
import crypto from 'crypto-js';
import path from 'path';
import { writeFile, readFile } from 'domain/filesystem';
import { getMimeType } from '@/util'


const host = window.location.hostname;
const port = window.location.port
const wsProtocol = window.location.protocol;
// const MINIO_ENDPOINT = `${wsProtocol}//${host}:${port}/minio`;
// const MINIO_ENDPOINT = 'http://206.190.239.91/minio';
const MINIO_ENDPOINT = `https://network.jancsitech.net:9000`;
const ACCESS_KEY = 'jancsitech';
const ACCESS_SECRET = 'jancsitech';
const BUCKET_NAME = 'chatcro-test-file';


// 创建一个 S3 客户端实例
const s3 = new AWS.S3({
    endpoint: new AWS.Endpoint(`${MINIO_ENDPOINT}`),
    accessKeyId: ACCESS_KEY,
    secretAccessKey: ACCESS_SECRET,
    s3ForcePathStyle: true, // 强制使用路径样式的 URL
});




// 生成基于文件名的哈希值
function generateFileNameHash(fileName) {
    return crypto.SHA256(fileName).toString();
}

// 上传文件
export async function uploadFile(filepath) {
    try {
        const fileName = path.basename(filepath);
        const fileHash = generateFileNameHash(fileName);
        const fileExtension = path.extname(fileName).slice(1); // 去掉扩展名前的点
        const objectName = `${fileHash}.${fileExtension}`;

        // 从 BrowserFS 读取文件内容
        const fileBuffer = await readFile(filepath);
        const buffer = Buffer.from(fileBuffer);

        const params = {
            Bucket: BUCKET_NAME,
            Key: objectName,
            Body: buffer,
            ContentType: getMimeType(fileExtension), // 动态设置 ContentType
        };

        await s3.upload(params).promise();
        console.log(`File uploaded successfully. Object name: ${objectName}`);
        return objectName;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

// 下载文件
export async function downloadFile(objectName, downloadPath) {
    try {
        const params = {
            Bucket: BUCKET_NAME,
            Key: objectName,
        };

        const data = await s3.getObject(params).promise();
        const fileBuffer = data.Body;

        // 写入文件到 BrowserFS
        await writeFile(downloadPath, fileBuffer);

        console.log(`File downloaded successfully to ${downloadPath}`);
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error;
    }
}
