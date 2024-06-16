import { CollaborationSync } from './RealtimeFolderSync.js';

export const create = async () => {
    const domainUrl = 'ws://10.10.101.126:8080/api/realtime/convergence/default';
    const rootPath = '/example';
    const userId = 'creator-user-id';

    // 生成一个唯一的 collectionId
    const collectionId = `${rootPath}-${userId}`;

    // 创建 CollaborationSync 实例
    const collaborationSync = new CollaborationSync(domainUrl, collectionId, userId, rootPath);

    await collaborationSync.connect();

    // 当需要时同步本地文件夹结构到协作者
    await collaborationSync.syncLocalFolderToCollaborators();

    // 分享 collectionId 和 rootPath 给其他参与同步的人
    console.log(`Share the following URL with collaborators: ${window.location}/?collectionId=${encodeURIComponent(collectionId)}&rootPath=${encodeURIComponent(rootPath)}`);

}
