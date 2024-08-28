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
  compileMessages:[],
  setCompiledPdfUrl:async (pdfUrl) => {
    get().revokeCompiledPdfUrl(get().pdfUrl);
    set(() => ({ pdfUrl }));
    await useFileStore.getState().updateProject(pdfUrl);
  },
  setCompilerLog: (compilerLog) => set(() => ({ compilerLog })),
  setCompileMessages: (compileMessages) => set(() => ({ compileMessages })),
  setShowCompilerLog: (showCompilerLog) => set(() => ({ showCompilerLog })),
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
} = usePdfPreviewStore.getState();
