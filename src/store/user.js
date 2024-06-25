/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
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
      accessToken: "",
      updateUser(user) {
        set((state) => ({ user }));
      },
      setIsFirstLogin(isFirstLogin) {
        set((state) => ({ isFirstLogin }));
      },
      updateTip(tip) {
        set((state) => ({ tip }));
      },
      updateAccessToken(cookie) {
        set((state) => ({ accessToken: cookie }));
      },
    }),
    {
      name: USER_KEY,
      version: 1,
    }
  )
);

export const { updateAccessToken, user } = useUserStore.getState();
