/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-09-14 10:36:22
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const COMPILE_SETTING = "COMPILE_SETTING";

// 定义默认设置
const defaultSetting = {
  compiler: "xeLaTeX",
  nonstop: "on",
  autoCompile: "on",
};

const defaultCompileSetting = {
  isPdfLatex: false,
  nonstop: true,
  autoCompile: true,
};

export const useCompileSetting = create(
  persist(
    (set, get) => ({
      setting: defaultSetting,
      compileSetting: defaultCompileSetting,
      getSetting(key) {
        return get().setting[key];
      },
      updateSetting(key, value) {
        set((state) => ({
          setting: {
            ...state.setting,
            [key]: value,
          },
        }));
        get().getPdfLatex();
      },
      getPdfLatex() {
        let isPdfLatex = get().getSetting("compiler") === "pdfLaTeX";
        let nonstop = get().getSetting("nonstop") === "on";
        let autoCompile = get().getSetting("autoCompile") === "on";
        set({
          compileSetting: {
            isPdfLatex,
            nonstop,
            autoCompile,
          },
        });
      },
      initializeDefaults(currentCompileSettings) {
        const currentSettings = get().setting;
        const updatedSettings = { ...defaultSetting, ...currentSettings };
        const updateCompileSetting = {
          ...defaultCompileSetting,
          ...currentCompileSettings,
        };
        set({ setting: updatedSettings, compileSetting: updateCompileSetting });
      },
    }),
    {
      name: COMPILE_SETTING,
      version: 1,
    }
  )
);
