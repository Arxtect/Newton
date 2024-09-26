/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-09-14 10:36:38
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const CHAT_KEY = "CHAT";

export const useChatStore = create()(
  persist(
    (set, get) => ({
      chatAccessToken: {},
      updateChatAccessToken(key, value) {
        set((state) => ({
          chatAccessToken: {
            ...state.chatAccessToken,
            [key]: value,
          },
        }));
      },
      showPrompt: false,
      handleAccept: null,
      handleReject: null,
      showPromptMessage: () => set({ showPrompt: true }),
      hidePromptMessage: () => set({ showPrompt: false }),
      saveHandleAccept: (handle) => set({ handleAccept: handle }),
      saveHandleReject: (handle) => set({ handleReject: handle }),
    }),
    {
      name: CHAT_KEY,
      version: 1,
    }
  )
);

export const { chatAccessToken, updateChatAccessToken } =
  useChatStore.getState();
