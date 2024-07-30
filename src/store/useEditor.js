import { create } from "zustand";

export const useEditor = create((set, get) => ({
  editor: null,
  updateEditor: (editor) => {
    set({ editor });
  },
  redo: () => {
    get()?.editor.execCommand("redo");
  },
  undo: () => {
    get()?.editor.execCommand("undo");
  },
  search: () => {
    get()?.editor.execCommand("find");
  },
}));

export const { editor, updateEditor, redo, undo, search } =
  useEditor.getState();
