import { create } from "zustand";

export const useEditor = create((set) => ({
  editor: null,
  updateEditor: (editor) => {
    set({ editor });
  },
}));

export const { editor, updateEditor } = useEditor.getState();
