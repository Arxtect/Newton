import React, { useEffect } from "react";
import { useGitRepo } from "store";
import GitBriefHistory from "../gitBriefHistory";
import BranchController from "./branchController";
import { Staging } from "./staging";

export const GitViewer = () => {
  const {
    git,
    config,
    projectRoot,
    // Actions
    initializeGitStatus,
    mergeBranches,
    pushCurrentBranchToOrigin,
    moveToBranch,
    checkoutNewBranch,
    pushScene,
    addToStage,
    resetIndex,
    removeFileFromGit,
    commitStagedChanges,
  } = useGitRepo();

  useEffect(() => {
    if (git.type === "loading") {
      initializeGitStatus(projectRoot);
    }
  }, [git.type, initializeGitStatus, projectRoot]);

  if (git.type === "loading") {
    return <span>[Git] initialize...</span>;
  }

  const { currentBranch, branches, remotes, remoteBranches, statusMatrix } =
    git;

  return (
    <div key={projectRoot} style={{ width: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div>
          {projectRoot} [{currentBranch}]
        </div>
        <BranchController
          config={config}
          remoteBranches={remoteBranches}
          projectRoot={projectRoot}
          currentBranch={currentBranch}
          branches={branches}
          remotes={remotes}
          onClickMerge={(ref1, ref2) => {
            mergeBranches({ projectRoot, ref1, ref2 });
          }}
          onClickGitPush={(branchName) => {
            pushCurrentBranchToOrigin(projectRoot, branchName);
          }}
          onChangeBranch={(branchName) => {
            moveToBranch({ projectRoot, branch: branchName });
          }}
          onClickCreateBranch={(newBranchName) => {
            checkoutNewBranch({ projectRoot, branch: newBranchName });
          }}
          onClickOpenConfig={() => {
            pushScene({ nextScene: "config" });
          }}
        />
        <div style={{ flex: 1 }}>
          {statusMatrix && (
            <Staging
              statusMatrix={statusMatrix}
              config={config}
              onClickReload={() => {
                initializeGitStatus(projectRoot);
              }}
              onClickOpenConfig={() => {
                pushScene({ nextScene: "config" });
              }}
              onClickGitAdd={(relpath) => {
                addToStage({ projectRoot, relpath });
              }}
              onClickGitReset={(relpath) => {
                resetIndex({ projectRoot, relpath });
              }}
              onClickGitRemove={(relpath) => {
                removeFileFromGit({ projectRoot, relpath });
              }}
              onClickGitCommit={(message) => {
                commitStagedChanges({
                  projectRoot,
                  message: message || "Update",
                });
              }}
            />
          )}
        </div>
      </div>
      <GitBriefHistory />
    </div>
  );
};
