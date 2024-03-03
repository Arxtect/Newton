import React, { useEffect } from "react";
import { useGitRepo, useFileStore } from "store";
import GitBriefHistory from "../gitBriefHistory";
import BranchController from "./branchController";
import { Staging } from "./staging";
import Typography from "@mui/material/Typography";

const GitViewer = () => {
  const {
    type,
    currentBranch,
    branches,
    remotes,
    remoteBranches,
    statusMatrix,
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

  const { projectRoot } = useFileStore((state) => ({
    projectRoot: state.currentProjectRoot,
  }));

  useEffect(() => {
    if (type === "loading") {
      initializeGitStatus(projectRoot);
    }
  }, [type, initializeGitStatus, projectRoot]);

  if (type === "loading") {
    return <span>[Git] initialize...</span>;
  }

  return (
    <div key={projectRoot} style={{ width: "100%", boxSizing: "border-box" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Typography variant="body1" className="my-2">
          {projectRoot} [{currentBranch}]
        </Typography>
        <BranchController
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

export default GitViewer;
