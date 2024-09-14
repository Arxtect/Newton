import { create } from "zustand";
import { persist } from "zustand/middleware";

export const CHAT_KEY = "CHAT";

export const useChatStore = create()(
  persist(
    (set, get) => ({
      chatAccessToken: {},
      updateChatAccessToken(key, value) {
        set((state) => ({
          accessToken: {
            ...state.accessToken,
            [key]: value,
          },
        }));
      },
    }),
    {
      name: CHAT_KEY,
      version: 1,
    }
  )
);

export const { chatAccessToken, updateChatAccessToken } = useChatStore.getState();
