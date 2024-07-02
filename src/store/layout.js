/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-08 15:40:31
 */
// store.js
import create from "zustand";

export const useLayout = create((set) => ({
  showHeader: false,
  showSide: true,
  showEditor: true,
  showView: true,
  showXterm: false,
  showFooter: true,
  sideWidth: 200, // 初始侧边栏宽度
  xtermHeight: 150, // 初始底部面板高度
  willResizing: false,

  toggleSide: () => set((state) => ({ showSide: !state.showSide })),
  toggleXterm: () => set((state) => ({ showXterm: !state.showXterm })),
  toggleEditor: () =>
    set((state) => {
      if (!state.showView && state.showEditor) {
        return {
          showView: !state.showView,
          showEditor: !state.showEditor,
        };
      }
      return { showEditor: !state.showEditor };
    }),
  toggleView: () =>
    set((state) => {
      if (!state.showEditor && state.showView) {
        return {
          showView: !state.showView,
          showEditor: !state.showEditor,
        };
      }
      return { showView: !state.showView };
    }),
  showFooter: () => set((state) => ({ showFooter: !state.showFooter })),
  setSideWidth: (width) => set(() => ({ sideWidth: width })),
  setXtermHeight: (height) => set(() => ({ xtermHeight: height })),
  setWillResizing: (resizing) => set(() => ({ willResizing: resizing })),
}));
