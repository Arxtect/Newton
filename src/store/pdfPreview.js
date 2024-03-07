import { create } from "zustand";

export const usePdfPreviewStore = create((set) => ({
  pdfUrl: "",
  compilerLog: "",
  showCompilerLog: true,
  setCompiledPdfUrl: (pdfUrl) => set(() => ({ pdfUrl })),
  setCompilerLog: (compilerLog) => set(() => ({ compilerLog })),
  setShowCompilerLog: (showCompilerLog) => set(() => ({ showCompilerLog })),
  toggleCompilerLog: () =>
    set((state) => ({ showCompilerLog: !state.showCompilerLog })),
}));

export const { setCompiledPdfUrl, setCompilerLog, setShowCompilerLog } =
  usePdfPreviewStore.getState();
