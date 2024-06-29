import crypto from 'crypto-js';
import path from 'path';
import { writeFile } from 'domain/filesystem';
import { getMimeType } from '@/util'
import { uploadToS3, downloadFileFromS3 } from '@/services'

// 生成基于文件名的哈希值
function generateFileNameHash(fileName) {
    return crypto.SHA256(fileName).toString();
}

// 上传文件
export async function uploadFile(filepath, content) {
    try {
        const fileName = path.basename(filepath);
        const fileHash = generateFileNameHash(fileName);
        const fileExtension = path.extname(fileName).slice(1); // 去掉扩展名前的点
        const objectName = `${fileHash}.${fileExtension}`;
        const type = getMimeType(fileExtension)

        const { data } = await uploadToS3({
            filePath: objectName,
            blob: content,
            type: type
        })


        return data['file_name'];
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

// 下载文件
export async function downloadFile(objectName, downloadPath) {
    try {

        const fileBuffer = await downloadFileFromS3(objectName)
        // 写入文件到 BrowserFS
        await writeFile(downloadPath, fileBuffer);

        console.log(`File downloaded successfully to ${downloadPath}`);
    } catch (error) {
        console.error('Error downloading file:', error);
        throw error;
    }
}
