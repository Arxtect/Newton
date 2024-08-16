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
  setCompiledPdfUrl:async (pdfUrl) => {
    get().revokeCompiledPdfUrl(get().pdfUrl);
    set(() => ({ pdfUrl }));
    await useFileStore.getState().updateProject(pdfUrl);
  },
  setCompilerLog: (compilerLog) => set(() => ({ compilerLog })),
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
} = usePdfPreviewStore.getState();
