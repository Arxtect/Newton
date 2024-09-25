import create from "zustand";

import { persist } from "zustand/middleware";
import { existsPath } from "domain/filesystem";
import path from "path";
import * as Git from "domain/git";
import { useFileStore, startUpdate } from "./useFileStore";
import { useUserStore } from "./useUserStore";
import { toast } from "react-toastify";
import fs from "fs";

export const GIT_STORE = "git_store";

export function getInitialRepoState() {
  return {
    type: "loading",
    loaded: false,
    currentBranch: null,
    branches: [],
    remotes: [],
    remoteBranches: [],
    history: [],
    statusMatrix: null,
    stagingLoading: true,

    //git config
    committerName: "",
    committerEmail: "",
    githubApiToken: "",
    corsProxy: "https://cors.isomorphic-git.org",
    gitEasyMode: true,
    isCanPush: false,
  };
}

export const useGitRepo = create()(
  persist(
    (set, get) => ({
      type: "loading",
      loaded: false,
      currentBranch: null,
      branches: [],
      remotes: [],
      remoteBranches: [],
      history: [],
      statusMatrix: null,
      stagingLoading: true,

      //git config
      // committerName: "test",
      // committerEmail: "test@gmail.com",
      // githubApiToken: "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",
      committerName: "",
      committerEmail: "",
      githubApiToken: "",
      corsProxy: "https://cors.isomorphic-git.org",
      gitEasyMode: true,
      isCanPush: false,

      // Actions
      changeConfig: ({
        committerName,
        committerEmail,
        corsProxy,
        gitEasyMode,
        githubApiToken,
      }) => {
        set((state) => ({
          ...state,
          ...(committerName !== undefined && { committerName }),
          ...(committerEmail !== undefined && { committerEmail }),
          ...(corsProxy !== undefined && { corsProxy }),
          ...(gitEasyMode !== undefined && { gitEasyMode }),
          ...(githubApiToken !== undefined && { githubApiToken }),
        }));
      },

      failInitialize: () => set({ type: "no-git" }),

      endInitialize: ({
        history,
        currentBranch,
        branches,
        remotes,
        remoteBranches,
        statusMatrix,
      }) =>
        set({
          type: "git",
          loaded: true,
          currentBranch,
          branches,
          remotes,
          remoteBranches,
          history,
          statusMatrix,
          stagingLoading: true,
        }),

      progressStagingLoading: ({ status: { filepath, status } }) => {
        // Implement based on how you want to modify the state
      },

      updateStatusMatrix: ({ matrix }) =>
        set((state) => ({ statusMatrix: matrix })),

      updateBranchStatus: ({ currentBranch, branches }) =>
        set({ currentBranch, branches }),

      updateRemotes: async ({ remotes }) => {
        set({ remotes });
      },
      initializeGitStatus: async ({ projectRoot }) => {
        let isExists = await existsPath(path.join(projectRoot, ".git"));
        if (!isExists) {
          get().endInitialize({ ...getInitialRepoState() });
          return;
        }
        const { currentBranch, branches, remotes, remoteBranches } =
          await Git.getBranchStatus(projectRoot);

        const history = await Git.getHistory(projectRoot, {
          ref: currentBranch,
        });
        console.log(
          currentBranch,
          branches,
          remotes,
          remoteBranches,
          "currentBranch"
        );
        const statusMatrix = await Git.statusMatrix({ fs, dir: projectRoot });
        get().endInitialize({
          history,
          currentBranch,
          branches,
          remotes,
          remoteBranches,
          statusMatrix,
        });
      },

      mergeBranches: async ({ projectRoot, ref1, ref2 }) => {
        await Git.merge({
          fs,
          dir: projectRoot,
          ours: ref1,
          theirs: ref2,
        });
        await get().updateHistory({ projectRoot, branch: ref1 });
      },

      checkoutNewBranch: async ({ projectRoot, branch }) => {
        await Git.createBranch(projectRoot, branch);
        await Git.checkoutBranch(projectRoot, branch);
        const { branches } = await Git.getBranchStatus(projectRoot);
        set({ branches, currentBranch: branch });
      },

      deleteBranch: async ({ projectRoot, branch }) => {
        const state = get();
        await Git.deleteBranch(projectRoot, branch);
        if (state.currentBranch === branch) {
          await Git.checkoutBranch(projectRoot, "main");
        }
        const { branches, currentBranch } = await Git.getBranchStatus(
          projectRoot
        );
        set({ branches, currentBranch });
      },

      updateHistory: async ({ projectRoot, branch }) => {
        const history = await Git.getHistory(projectRoot, {
          ref: branch,
        });
        set({ history });
      },

      commitStagedChanges: async ({ projectRoot, message }) => {
        const state = get();
        const { committerName, committerEmail, statusMatrix, currentBranch } =
          state;
        const author = {
          name: committerName || "<none>",
          email: committerEmail || "<none>",
        };
        await Git.commitChanges(projectRoot, message, author);
        if (statusMatrix) {
          const newMat = await Git.updateStatusMatrix(
            projectRoot,
            statusMatrix,
            []
          );
          set({ statusMatrix: newMat });
        }
        await get().updateHistory({ projectRoot, branch: currentBranch });
        const isCanPush = await Git.isCanPush({
          projectRoot,
          ref: currentBranch,
          remote: "origin",
          token: state.githubApiToken,
          corsProxy: state.corsProxy,
        });
        set({ isCanPush });
      },

      commitAll: async ({ message }) => {
        let user = useUserStore.getState().user;
        console.log(user, "user");
        const state = get();
        const { statusMatrix, currentBranch } = get();
        const { currentProjectRoot: projectRoot } = useFileStore.getState();
        if (statusMatrix) {
          const author = {
            name: user?.name,
            email: user?.email,
          };
          await Git.commitAll(projectRoot, message, author);
          const newMat = await Git.updateStatusMatrix(
            projectRoot,
            statusMatrix,
            []
          );
          set({ statusMatrix: newMat });
          await get().updateHistory({ projectRoot, branch: currentBranch });
          const isCanPush = await Git.isCanPush({
            projectRoot,
            ref: currentBranch,
            remote: "origin",
            token: state.githubApiToken,
          });
          set({ isCanPush });
        }
      },
      updateStatusMatrixOnSaveFile: async ({ projectRoot }) => {
        try {
          let isExists = await existsPath(path.join(projectRoot, ".git"));
          console.log(isExists, "isExists");
          if (!isExists) {
            return;
          }
          const { statusMatrix } = get();
          const newMat = await Git.updateStatusMatrix(
            projectRoot,
            statusMatrix,
            []
          );
          set({ statusMatrix: newMat });
        } catch (e) {
          console.log(e, "updateStatusMatrixOnSaveFile");
        }
      },
      pushCurrentBranchToOrigin: async () => {
        const state = get();
        const githubToken = state.githubApiToken;
        const { currentProjectRoot: projectRoot } = useFileStore.getState();
        const { currentBranch } = await Git.getBranchStatus(projectRoot);

        const onProgress = (progress) => {
          console.log("progress", progress);
        };
        const onMessage = (message) => {
          console.log("message", message);
        };

        if (githubToken.length > 0) {
          try {
            const pushResult = await Git.pushBranch({
              projectRoot,
              remote: "origin",
              ref: currentBranch,
              token: githubToken,
              onProgress,
              onMessage,
            });
            if (pushResult) {
              toast.success("Push successful");
              startUpdate({});
            } else {
              toast.warning("no commits to push");
            }
          } catch (e) {
            toast.error(`Push failed: ${e.message}`);
          }
        } else {
          console.error("push failed, no github token");
          toast.error("Push failed, no github token");
        }
      },
      moveToBranch: async ({ projectRoot, branch }) => {
        await Git.checkoutBranch(projectRoot, branch);
        const state = get();
        state.updateBranchStatus({
          currentBranch: branch,
          branches: state.branches,
        });
        await get().updateHistory({ projectRoot, branch });
        const { filepath, loadFile, unloadFile } = useFileStore.getState();
        if (filepath) {
          unloadFile();
          loadFile({ filepath: filepath });
        }
      },
      addToStage: async ({ projectRoot, relpath }) => {
        await Git.addFile(projectRoot, relpath);
        startUpdate({ changedPath: path.join(projectRoot, relpath) });
      },
    }),
    {
      name: GIT_STORE,
      version: 1,
    }
  )
);

export const { initializeGitStatus, updateStatusMatrixOnSaveFile } =
  useGitRepo.getState();
