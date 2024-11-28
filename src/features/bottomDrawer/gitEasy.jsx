import React, { useEffect, useMemo, useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import { useGitRepo, useFileStore } from "store";
import GitBriefHistory from "./gitBriefHistory";
import ArLoadingButton from "@/components/arLoadingButton";
import { existsPath, removeDirectory, getAllFileNames } from "domain/filesystem";
import path from "path";
import { useGitStatus, useCommitAndPush } from "@/useHooks";

const GitEasy = () => {
  const [commitMessage, setCommitMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { hasChanges, modified, removable } = useGitStatus();
  const commitAndPush = useCommitAndPush();
  const { projectRoot } = useFileStore((state) => ({
    projectRoot: state.currentProjectRoot,
  }));
  const {
    githubApiToken,
    currentBranch,
    statusMatrix,
    corsProxy,
    remotes,
    updateRemotes,
    commitAll,
    pushCurrentBranchToOrigin,
    initializeGitStatus,
    isCanPush,
  } = useGitRepo((state) => ({
    githubApiToken: state.githubApiToken,
    currentBranch: state.currentBranch,
    statusMatrix: state.statusMatrix,
    corsProxy: state.corsProxy,
    remotes: state.remotes,
    updateRemotes: state.updateRemotes,
    commitAll: state.commitAll,
    pushCurrentBranchToOrigin: state.pushCurrentBranchToOrigin,
    initializeGitStatus: state.initializeGitStatus,
    isCanPush: state.isCanPush,
  }));

  
  const handleCommit = async () => {
    setLoading(true);
    try {
      await commitAndPush(commitMessage);
      setCommitMessage("");
    } finally {
      setLoading(false);
    }
  };

  const gitFolderPath = path.join(projectRoot, ".git");
  const handleRemoveGitFolder = async () => {
    console.log(`gitFolderPath: ${gitFolderPath}`);
    console.log(`Type of gitFolderPath: ${typeof gitFolderPath}`);
    if (!(await existsPath(gitFolderPath))) {
      console.log(`Directory ${gitFolderPath} does not exist.`);
      return;
    }
    if (typeof gitFolderPath !== "string") {
      console.error("Error: gitFolderPath is not a string");
      return;
    }

    console.log(`Attempting to remove git folder at: ${gitFolderPath}`);
    await removeDirectory(gitFolderPath);
    console.log(`Removal attempt completed. Now listing remaining files.`);
    let list = await getAllFileNames(projectRoot);
    console.log(list, "Remaining files after removal:");
  };

  if (!statusMatrix) {
    return <CircularProgress />;
  }

  return (
    <React.Fragment>
      <div className="border border-gray-300 radius mt-3">
        <Accordion
          defaultExpanded
          sx={{
            minHeight: 32,
            "& .Mui-expanded": {
              minHeight: "32px !important",
            },
          }}
        >
          <AccordionSummary
            sx={{
              minHeight: 32,
              "& .MuiAccordionSummary-content": { margin: "0px !important" },
              "& .MuiAccordionSummary-expandIconWrapper": { padding: "0px" },
            }}
            className="mh-0"
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography
              variant="caption"
              sx={{ fontSize: "0.75rem", lineHeight: "32px" }}
            >
              Changes
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <TextField
                size="small"
                variant="outlined"
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Sync message"
              />
              <ArLoadingButton
                variant="contained"
                size="small"
                disabled={!hasChanges}
                onClick={handleCommit}
                data-testid="commit-all-button"
                loading={loading}
              >
                Sync All
              </ArLoadingButton>
              {/* <ArLoadingButton
                variant="contained"
                size="small"
                onClick={handleRemoveGitFolder}
                data-testid="remove-git-folder-button"
              >
                Unlink
              </ArLoadingButton> */}
              {/* <Button
                variant="contained"
                size="small"
                color="success"
                onClick={() => pushCurrentBranchToOrigin()}
                data-testid="push-all-button"
              >
                Push
              </Button> */}
            </div>
            {!hasChanges && (
              <Typography
                variant="caption"
                sx={{ fontSize: "0.75rem", lineHeight: "32px" }}
              >
                No Changes
              </Typography>
            )}
            {hasChanges && (
              <>
                <div>
                  {modified.map((filepath) => (
                    <div key={filepath} className="my-1">
                      {filepath} (modified)
                    </div>
                  ))}
                </div>
                <div>
                  {removable.map((filepath) => (
                    <div key={filepath} className="my-1">
                      {filepath} (deleted)
                    </div>
                  ))}
                </div>
              </>
            )}
          </AccordionDetails>
        </Accordion>
      </div>
      <GitBriefHistory />
    </React.Fragment>
  );
};

export default GitEasy;