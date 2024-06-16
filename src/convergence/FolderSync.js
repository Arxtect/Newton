import { readDirectoryTree, writeDirectoryTree } from '@/domain/filesystem'

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

export default FolderSync;
