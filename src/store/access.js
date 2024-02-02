import { create } from "zustand";
import { persist } from "zustand/middleware";

export const ACCESS_KEY = "access-control";

export const useAccessStore = create()(
  persist(
    (set, get) => ({
      token: "",
      accessCode: "",
      user: {},
      updateCode(code) {
        set((state) => ({ accessCode: code }));
      },
      updateToken(token) {
        set((state) => ({ token }));
      },
      updateUser(user) {
        set((state) => ({ user }));
      },
    }),
    {
      name: ACCESS_KEY,
      version: 1,
    }
  )
);
