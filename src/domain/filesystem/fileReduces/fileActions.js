import create from 'zustand';
import * as FS from '../index';
import extToFileType from './extToFileType'
import path from 'path'

// Define a store using Zustand
const useFileStore = create((set, get) => ({
    autosave: true,
    filepath: '',
    filetype: 'text',
    changed: false,
    value: '',
    lastSavedValue: '',
    reloadCounter: 0,

    // repo
    fileCreatingDir: null,
    dirCreatingDir: null,
    renamingPathname: null,
    currentProjectRoot: "/playground",
    touchCounter: 0,

    // Actions
    setAutosave: (autosave) => set({ autosave }),
    loadFile: async ({ filepath }) => {
        const fileContent = await FS.readFile(filepath);
        set({
            filepath,
            filetype: extToFileType(filepath), // You will need to define extToFileType function
            value: fileContent.toString(),
            lastSavedValue: fileContent.toString(),
            changed: false,
        });
    },
    saveFileState: async (value) => {
        set((state) => ({
            ...state,
            value: value || state.value,
            lastSavedValue: value,
            changed: false,
        }));

    },
    saveFile: async (filepath, value, withReload = false) => {
        await FS.writeFile(filepath, value);
        get().saveFileState(value);

        if (withReload) {
            get().reload();
        }

        // Update git status
        // TODO: Skip git on background
        // const state = get();
        // const projectRoot = state.repository.currentProjectRoot;
        // const relpath = path.relative(projectRoot, filepath);
        // if (!relpath.startsWith("..") && state.git.statusMatrix) {
        //     const newMat = await Git.updateStatusMatrix(
        //         projectRoot,
        //         state.git.statusMatrix,
        //         []
        //     );
        // GitActions.updateStatusMatrix(newMat); // Assuming GitActions.updateStatusMatrix is adapted for Zustand
        // }
    },
    reload: () => {
        const state = get();
        set({ reloadCounter: state.reloadCounter + 1 });
    },
    unloadFile: () => {
        const initialState = getInitialState();
        set({ ...initialState, changed: false });
    },
    changeValue: (value) => {
        const state = get();
        if (state.autosave) {
            set({
                value,
                lastSavedValue: value,
                changed: false,
            });
        } else {
            set({
                value,
                changed: state.lastSavedValue !== value,
            });
        }
    },
    updateFileContent: async (filepath, value, withReload = false) => {
        const state = get();

        if (state.autosave) {
            get().saveFileState(value);
            await FS.writeFile(filepath, value);
        } else {
            get().changeValue(value);
        }

        // 更新 git 状态
        // // TODO: 在后台跳过 git
        // const projectRoot = state.repository.currentProjectRoot;
        // const relpath = path.relative(projectRoot, filepath);
        // if (!relpath.startsWith("..") && state.git.statusMatrix) {
        //     const newMat = await Git.updateStatusMatrix(
        //         projectRoot,
        //         state.git.statusMatrix,
        //         []
        //     );
        //     GitActions.updateStatusMatrix(newMat); // 假设 GitActions.updateStatusMatrix 已适配 Zustand
        // }

    },

    // repo
    startFileCreating: (fileCreatingDir) => {
        set({ fileCreatingDir });
    },
    startDirCreating: (dirCreatingDir) => {
        set({ dirCreatingDir });
    },
    repoChanged: () => {
        const state = get();
        set({ touchCounter: state.touchCounter + 1 });
    },
    endFileCreating: (filepath) => {
        set({ fileCreatingDir: null });
    },
    endDirCreating: (filepath) => {
        set({ dirCreatingDir: null });
    },
    startUpdate: async ({ changedPath, isDir = false }) => {
        get().repoChanged();
        if (!isDir && changedPath) {
            const state = get();
            const projectRoot = state.currentProjectRoot;
            const relpaths = (Array.isArray(changedPath) ? changedPath : [changedPath])
                .map((p) => path.relative(projectRoot, p))
                .filter((r) => !r.startsWith(".."));

            // if (relpaths.length > 0 && state.git.statusMatrix) {
            //     const newMat = await Git.updateStatusMatrix(
            //         projectRoot,
            //         state.git.statusMatrix,
            //         []
            //     );
            //     set((state) => ({
            //         ...state,
            //         git: {
            //             ...state.git,
            //             statusMatrix: newMat
            //         }
            //     }));
            // }
        }
    },

    removeFileFromGit: async ({ projectRoot, relpath }) => {
        // await Git.removeFromGit(projectRoot, relpath);
        get().startUpdate({ changedPath: path.join(projectRoot, relpath) });
    },

    deleteProject: async ({ dirpath }) => {
        await FS.removeDirectory(dirpath);
        // 假设 ProjectActions.loadProjectList 已适配 Zustand
        // get().loadProjectList();
    },

    finishFileCreating: async ({ filepath }) => {
        await FS.writeFile(filepath, "");
        get().endFileCreating(filepath);
        get().startUpdate({ changedPath: filepath });
        // 假设 loadFile 已适配 Zustand
        get().loadFile({ filepath });
    },
    cancelFileCreating: () => {
        console.log('cancelFileCreating')
    },
    cancelDirCreating: () => {
        console.log('cancelDirCreating')
    },
    finishDirCreating: async ({ dirpath }) => {
        await FS.mkdir(dirpath);
        get().endDirCreating({ dirpath });
        get().startUpdate({ changedPath: dirpath, isDir: true });
    },

    createFile: async ({ filepath, content = "" }) => {
        await FS.writeFile(filepath, content);
        get().loadFile({ filepath }); // 假设 loadFile 已适配 Zustand
        get().startUpdate({ changedPath: filepath });
    },

    createDirectory: async ({ dirname }) => {
        await FS.mkdir(dirname);
        get().startUpdate({ changedPath: dirname, isDir: true });
    },

    deleteFile: async ({ filename }) => {
        await FS.unlink(filename);
        get().startUpdate({ changedPath: filename });
    },
    deleteDirectory: async ({ dirpath }) => {
        const files = await FS.getFilesRecursively(dirpath);
        await FS.removeDirectory(dirpath);
        get().startUpdate({ changedPath: files });
        // TODO: 这里可能需要更新 Git 状态，根据你的应用逻辑进行调整
    },

    fileMoved: async ({ fromPath, destPath }) => {
        get().startUpdate({ changedPath: [fromPath, destPath] });
    },

}));

function getInitialState() {
    return {
        autosave: true,
        filepath: '',
        filetype: 'text',
        changed: false,
        value: '',
        lastSavedValue: '',
        reloadCounter: 0,
    };
}

export default useFileStore;
