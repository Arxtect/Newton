/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const COMPILE_SETTING = "COMPILE_SETTING";

export const useCompileSetting = create()(
  persist(
    (set, get) => ({
      setting: {
        compiler: "xeLaTeX",
      },
      isPdfLatex:false,
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
        let isPdfLatex = get().getSetting("compiler") == "pdfLaTeX";
         set({
           isPdfLatex
         });
      }
    }),
    {
      name: COMPILE_SETTING,
      version: 1,
    }
  )
);
