/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-08 15:40:31
 */
// store.js
import create from "zustand";

export const useStore = create((set) => ({
  showHeader: false,
  showSide: true,
  showEditor: true,
  showView: true,
  showXterm: false,
  showFooter: true,
  sideWidth: 200, // 初始侧边栏宽度
  xtermHeight: 150, // 初始底部面板高度

  toggleSide: () => set((state) => ({ showSide: !state.showSide })),
  toggleXterm: () => set((state) => ({ showXterm: !state.showXterm })),
  toggleEditor: () => set((state) => ({ showEditor: !state.showEditor })),
  toggleView: () => set((state) => ({ showView: !state.showView })),
  showFooter: () => set((state) => ({ showFooter: !state.showFooter })),
  setSideWidth: (width) => set(() => ({ sideWidth: width })),
  setXtermHeight: (height) => set(() => ({ xtermHeight: height })),
}));
