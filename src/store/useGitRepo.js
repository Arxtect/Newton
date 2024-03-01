import create from "zustand";

import { persist } from "zustand/middleware";
import * as FS from "domain/filesystem";
import path from "path";

export const GIT_STORE = "git_store";

export const useFileStore = create()(
  persist(
    (set, get) => ({
      git: {
        type: "loading", // Example initial state
        currentBranch: "",
        branches: [],
        stagingLoading: false,
        remotes: [],
        remoteBranches: [],
        statusMatrix: null,
      },
      projectRoot: "",
      githubApiToken: "",
      currentBranch: "",
      statusMatrix: null,
      corsProxy: "",
      remotes: [],
      history: [],
      easyMode: false, // Default value
      // Actions to update the state
      setProjectRoot: (projectRoot) => set(() => ({ projectRoot })),
      setGithubApiToken: (githubApiToken) => set(() => ({ githubApiToken })),
      setCurrentBranch: (currentBranch) => set(() => ({ currentBranch })),
      setStatusMatrix: (statusMatrix) => set(() => ({ statusMatrix })),
      setCorsProxy: (corsProxy) => set(() => ({ corsProxy })),
      setRemotes: (remotes) => set(() => ({ remotes })),
      setConfigValue: ({ key, value }) =>
        set((state) => ({ ...state, [key]: value })),
    }),
    {
      name: GIT_STORE,
      version: 1,
    }
  )
);
