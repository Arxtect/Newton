import RealtimeFolderSync from './RealtimeFolderSync';

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

export default CollaborationSync;
