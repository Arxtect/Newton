import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as FS from "domain/filesystem";
import path from "path";
import {
  initializeGitStatus,
  updateStatusMatrixOnSaveFile,
} from "./useGitRepo";
import { savePdfToIndexedDB, getPdfFromIndexedDB } from "@/util";
import { useUserStore } from "./user";
import { ProjectSync } from "@/convergence";
import { useEditor } from "./useEditor";
import { isAssetExtension } from "@/util";

export const FILE_STORE = "FILE_STORE";

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

export const useFileStore = create()(
  persist(
    (set, get) => ({
      autosave: true,
      filepath: "",
      assetsFilePath: "",
      filetype: "text",
      changed: false,
      value: "",
      assetValue: "",
      lastSavedValue: "",
      reloadCounter: 0,

      // repo
      fileCreatingDir: null,
      dirCreatingDir: null,
      renamingPathname: null,
      currentProjectRoot: "",
      currentProjectFileList: [],
      currentProjectBibFilepathList: [],
      projectSync: null,
      touchCounter: 0,
      currentSelectDir: "",
      preRenamingDirpath: "",
      allProject: [],
      dirOpen: false,
      shareUserList: [],
      isDropFileSystem: true,
      shareIsRead: false,
      updateCurrentProjectFileList: async (currentProjectRoot) => {
        const files = await FS.getFilesRecursively(currentProjectRoot);
        const relativePathPrefix = `${currentProjectRoot}/`;
        const modifiedFiles = files.map((file) => {
          // 使用正则表达式匹配第一个 sync-demo/ 并替换为相对路径
          if (
            file.includes(".git") ||
            file.includes("project-hasOwnProperty-arxtect-projectInfo.json")
          ) {
            return null;
          }
          return file.replace(new RegExp(`^${relativePathPrefix}`), "");
        });

        await get().updateCurrentProjectBibFilepathList(files);

        let fileList = modifiedFiles.filter((i) => !!i);

        set({ currentProjectFileList: fileList });

        // await get().changeMainFile(files);
      },
      updateCurrentProjectBibFilepathList: async (files) => {
        let list = files.filter((item) => {
          let fileExt = path.extname(item);
          return fileExt === ".bib";
        });
        set({ currentProjectBibFilepathList: list });
      },
      changeMainFile: async (currentProjectRoot) => {
        let newFiles = await FS.getFilesRecursively(currentProjectRoot);

        let mainFile = await FS.findMainFile(newFiles);
        await get().loadFile({ filepath: mainFile });
      },
      changeSingleBibFilepath: (bibFilepath, isAdd = true) => {
        let fileExt = path.extname(bibFilepath);
        if (fileExt !== ".bib") return;

        let bibFilepathList = get().currentProjectBibFilepathList;

        if (isAdd) {
          // Create a Set to ensure uniqueness
          let bibFilepathSet = new Set(bibFilepathList);
          bibFilepathSet.add(bibFilepath);
          set({
            currentProjectBibFilepathList: Array.from(bibFilepathSet),
          });
        } else {
          set({
            currentProjectBibFilepathList: bibFilepathList.filter(
              (item) => item !== bibFilepath
            ),
          });
        }
      },
      updateShareIsRead: (isRead) => set({ shareIsRead: isRead }),
      updateShareUserList: (shareUserList) => set({ shareUserList }),
      updateIsDropFileSystem: (isDropFileSystem) => set({ isDropFileSystem }),
      updateDirOpen: (dirOpen) => set({ dirOpen }),
      updateProjectSync: async (projectSync) => {
        await (projectSync && projectSync.setObserveHandler());
        set({ projectSync });
      },
      leaveProjectSyncRoom: () => {
        let projectSync = get().projectSync;
        console.log(projectSync, "leaveProjectSyncRoom");
        projectSync?.leaveCollaboration && projectSync?.leaveCollaboration();
        get().updateProjectSync(null);
        get().updateShareUserList([]);
      },
      updateProject: async (pdfBlob) => {
        const projectRoot = get().currentProjectRoot;
        // 保存PDF到IndexedDB
        await savePdfToIndexedDB(projectRoot, pdfBlob);
      },

      getCurrentProjectPdf: async (projectRoot) => {
        // 从IndexedDB获取PDF Blob
        const pdfBlob = await getPdfFromIndexedDB(projectRoot);
        if (pdfBlob) {
          return URL.createObjectURL(pdfBlob);
        }
        return null;
      },

      // Actions
      setAutosave: (autosave) => set({ autosave }),
      loadFile: async ({ filepath }) => {
        if (!filepath) return;
        const { editor } = useEditor.getState();
        const fileContent = await FS.readFile(filepath);

        if (isAssetExtension(filepath)) {
          set({
            assetsFilePath: filepath,
            // assetValue: fileContent,
            value: "",
            filepath: "",
            lastSavedValue: "",
            changed: false,
            // currentSelectDir: "",
          });
          return;
        }
        const projectSync = get().projectSync;

        console.log(projectSync, "projectSync");
        if (projectSync && editor != null && filepath) {
          editor.blur && editor.blur();
          projectSync?.updateEditorAndCurrentFilePath(filepath, editor);
        }
        set({
          filepath,
          assetsFilePath: "",
          fileContent: "",
          filetype: FS.extToFileType(filepath), // You will need to define extToFileType function
          value: fileContent.toString(),
          lastSavedValue: fileContent.toString(),
          changed: false,
          currentSelectDir: "",
        });
        console.log(fileContent, "fileContent");
      },
      changeCurrentSelectDir: (dirpath) => {
        set({ currentSelectDir: dirpath });
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
        await updateStatusMatrixOnSaveFile({
          projectRoot: get().currentProjectRoot,
        });
        if (withReload) {
          get().reload();
        }
      },
      reload: () => {
        let reloadCounter = get().reloadCounter;
        set({ reloadCounter: reloadCounter + 1 });
        get().repoChanged();
        console.log("RootDirectory", reloadCounter);
      },
      unloadFile: () => {
        const initialState = getInitialState();
        set({ ...initialState, changed: false });
      },
      debouncedUpdateFileContent: debounce((filepath, value, isSync) => {
        get().updateFileContent(filepath, value, isSync);
      }, 300),
      changeValue: (value, isSync = true) => {
        const state = get();
        if (state.autosave && isSync) {
          set({
            value,
            lastSavedValue: value,
            changed: false,
          });
          get().debouncedUpdateFileContent(state.filepath, value);
        } else {
          set({
            value,
            changed: state.lastSavedValue !== value,
          });
          get().debouncedUpdateFileContent(state.filepath, value, isSync);
        }
      },
      updateFileContent: async (
        filepath,
        value,
        isSync = true,
        withReload = false
      ) => {
        const state = get();
        state.changeSingleBibFilepath(filepath);
        if (!!state.shareIsRead) return;
        await state.saveFile(filepath, value, withReload);
        if (!isSync) return;
        const projectSync = get().projectSync;
        if (projectSync && filepath && isSync) {
          projectSync.syncFileToYMap(filepath, value);
        }
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
          const relpaths = (
            Array.isArray(changedPath) ? changedPath : [changedPath]
          )
            .map((p) => path.relative(projectRoot, p))
            .filter((r) => !r?.startsWith(".."));
        }
        updateStatusMatrixOnSaveFile({ projectRoot: get().currentProjectRoot });
      },

      removeFileFromGit: async ({ projectRoot, relpath }) => {
        // await Git.removeFromGit(projectRoot, relpath);
        get().startUpdate({ changedPath: path.join(projectRoot, relpath) });
      },

      deleteProject: async ({ dirpath }) => {
        console.log(dirpath, "dirpath");
        await FS.removeDirectory(dirpath);
        get().changeCurrentProjectRoot({
          projectRoot: get().allProject.filter((item) => item != dirpath)[0],
        });
        // 假设 ProjectActions.loadProjectList 已适配 Zustand
        // get().loadProjectList();
      },

      archivedDeleteProject: async ({ dirpath }) => {
        await FS.archiveRemoveProject(dirpath);
      },

      finishFileCreating: async ({ filepath }) => {
        await FS.writeFile(filepath, "");
        get().endFileCreating(filepath);
        get().startUpdate({ changedPath: filepath });
        // 假设 loadFile 已适配 Zustand
        get().loadFile({ filepath });
        get().changeSingleBibFilepath(filepath);
        get().updateDirOpen(false);
      },
      cancelFileCreating: () => {
        get().updateDirOpen(false);
        set({ fileCreatingDir: null });
      },
      cancelDirCreating: () => {
        get().updateDirOpen(false);
        set({ dirCreatingDir: null });
      },
      finishDirCreating: async ({ dirpath }) => {
        console.log(dirpath, "finishDirCreating");
        await FS.mkdir(dirpath);
        get().endDirCreating({ dirpath });
        get().startUpdate({ changedPath: dirpath, isDir: true });
        get().updateDirOpen(false);
      },

      createFile: async ({ filepath, content = "" }) => {
        await FS.writeFile(filepath, content);
        get().loadFile({ filepath }); // 假设 loadFile 已适配 Zustand
        get().startUpdate({ changedPath: filepath });
        get().changeSingleBibFilepath(filepath);
      },
      changeFolderPath: ({}) => {},

      createDirectory: async ({ dirname }) => {
        await FS.mkdir(dirname);
        get().startUpdate({ changedPath: dirname, isDir: true });
      },

      deleteFile: async ({ filename }) => {
        set({ filepath: "", value: "" });
        if (!(await FS.existsPath(filename))) return;
        await FS.unlink(filename);
        const projectSync = get().projectSync;
        if (projectSync && filename) {
          projectSync.deleteFile(filename);
        }
        get().changeSingleBibFilepath(filename, false);
        get().startUpdate({ changedPath: filename });
      },
      deleteDirectory: async ({ dirpath }) => {
        try {
          set({ filepath: "", value: "", currentSelectDir: "" });
          const files = await FS.getFilesRecursively(dirpath);
          const projectSync = get().projectSync;
          files.map((item) => {
            if (path.extname(item) === ".bib") {
              get().changeSingleBibFilepath(item, false);
            }
          });
          if (projectSync && dirpath) {
            projectSync.deleteFolder(dirpath);
          }
          await FS.removeDirectory(dirpath);
          get().startUpdate({ changedPath: files });
          // TODO: 这里可能需要更新 Git 状态，根据你的应用逻辑进行调整
        } catch (err) {
          console.log(err);
        }
      },

      fileMoved: async ({ fromPath, destPath }) => {
        get().startUpdate({ changedPath: [fromPath, destPath] });
      },
      startRenaming: ({ pathname }) => {
        set({ renamingPathname: pathname });
      },
      endRenaming: () => {
        set({ renamingPathname: null });
      },
      changePreRenamingDirpath: ({ dirpath }) => {
        console.log(dirpath, "changePreRenamingDirpath");
        set({ preRenamingDirpath: dirpath });
      },
      changeCurrentProjectRoot: async ({ projectRoot }) => {
        set({ projectSync: null });
        get().initFile();
        set({ currentProjectRoot: projectRoot, currentSelectDir: projectRoot });
        initializeGitStatus({ projectRoot });
        get().updateCurrentProjectFileList(projectRoot);
      },
      createProject: async (newProjectRoot) => {
        let isExists = await FS.existsPath(newProjectRoot);

        if (!isExists) {
          const user = useUserStore.getState().user;
          await FS.mkdir(newProjectRoot);
          await FS.createProjectInfo(newProjectRoot, {
            name: "YOU",
            ...user,
          });
        } else {
          throw new Error("Project name is already exists");
        }
        get().changeCurrentProjectRoot({ projectRoot: newProjectRoot });
      },
      copyProject: async (projectRoot, copyProjectRoot) => {
        let isExists = await FS.existsPath(copyProjectRoot);

        if (!isExists) {
          const user = useUserStore.getState().user;
          await FS.copyProject(projectRoot, copyProjectRoot);
          await FS.createProjectInfo(copyProjectRoot, {
            name: "YOU",
            ...user,
          });
        } else {
          throw new Error("Project name is already exists");
        }
        // get().changeCurrentProjectRoot({ projectRoot: copyProjectRoot });
      },
      updateAllProject: (allProject) => {
        set({ allProject });
      },
      initFile: () => {
        const initState = getInitialState();
        set(initState);
      },
    }),
    {
      name: FILE_STORE,
      version: 1,
    }
  )
);

export function getInitialState() {
  return {
    autosave: true,
    filepath: "",
    filetype: "text",
    changed: false,
    value: "",
    lastSavedValue: "",
    reloadCounter: 0,
    assetsFilePath: "",
    assetValue: "",
  };
}

export const { changeCurrentProjectRoot, startUpdate } =
  useFileStore.getState();
