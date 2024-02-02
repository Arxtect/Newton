/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-04-06 19:43:24
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const USER_KEY = "user-info";

export const useUserStore = create()(
  persist(
    (set, get) => ({
      user: {},
      isFirstLogin: false,
      tip: "",
      updateUser(user) {
        set((state) => ({ user }));
      },
      setIsFirstLogin(isFirstLogin) {
        set((state) => ({ isFirstLogin }));
      },
      updateTip(tip) {
        set((state) => ({ tip }));
      },
    }),
    {
      name: USER_KEY,
      version: 1,
    }
  )
);
