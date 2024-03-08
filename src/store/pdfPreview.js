import { create } from "zustand";
import { useFileStore } from "./useFileStore";

export const usePdfPreviewStore = create((set, get) => ({
  pdfUrl: "",
  compilerLog: "",
  showCompilerLog: true,
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
