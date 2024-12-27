/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const PROJECT_MENU = "project-menu";

export const useProjectMenu = create()(
  persist(
    (set, get) => ({
      currentSelectMenu: "all",
      setCurrentSelectMenu(currentSelectMenu) {
        set((state) => ({ currentSelectMenu }));
      },
    }),
    {
      name: PROJECT_MENU,
      version: 1,
    }
  )
);


