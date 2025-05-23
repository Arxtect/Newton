/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import { create } from "zustand";
import { useFileStore } from "./useFileStore";

export const usePdfPreviewStore = create((set, get) => ({
  pdfUrl: "",
  compilerLog: "",
  showCompilerLog: false,
  compileMessages: [],
  logInfo: {
    errorsLength: 0,
    warningsLength: 0,
    typesettingLength: 0,
  },
  setCompiledPdfUrl: async (pdfUrl, isSaveToIndexedDB = true) => {
    if (isSaveToIndexedDB) {
      get().revokeCompiledPdfUrl(get().pdfUrl);
      await useFileStore.getState().updateProject(pdfUrl);
    }
    set(() => ({ pdfUrl }));
  },
  setCompilerLog: (compilerLog) => set(() => ({ compilerLog })),
  setCompileMessages: (compileMessages) => set(() => ({ compileMessages })),
  setShowCompilerLog: (showCompilerLog) => set(() => ({ showCompilerLog })),
  setLogInfo: (logInfo) => set(() => ({ logInfo })),
  toggleCompilerLog: () =>
    set((state) => ({ showCompilerLog: !state.showCompilerLog })),
  revokeCompiledPdfUrl: (pdfUrl) => {
    set(() => ({ pdfUrl: "" }));
    URL.revokeObjectURL(pdfUrl);
  },
}));

export const {
  setCompiledPdfUrl,
  setCompilerLog,
  setShowCompilerLog,
  revokeCompiledPdfUrl,
  setCompileMessages,
  setLogInfo,
} = usePdfPreviewStore.getState();
