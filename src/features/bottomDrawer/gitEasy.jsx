import React, { useMemo, useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import { useGitRepo, useFileStore } from "store";
import GitBriefHistory from "./gitBriefHistory";
import {
  getRemovableFilenames,
  getModifiedFilenames,
} from "domain/git/queries/parseStatusMatrix";
import { toast } from "react-toastify";
import ArLoadingButton from "@/components/arLoadingButton";
import { existsPath, removeDirectory, getAllFileNames } from "domain/filesystem";
import path from "path";

const GitEasy = () => {
  const [commitMessage, setCommitMessage] = useState("");
  const [loading, setLoading] = useState(false)
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

  const { hasChanges, modified, removable } = useMemo(() => {
    const removableFiles = getRemovableFilenames(statusMatrix);
    const modifiedFiles = getModifiedFilenames(statusMatrix)?.filter(
      (a) => !removableFiles.includes(a)
    );
    const changes = modifiedFiles?.length > 0 || removableFiles?.length > 0;
    return {
      hasChanges: changes,
      modified: modifiedFiles,
      removable: removableFiles,
    };
  }, [statusMatrix]);

  if (!statusMatrix) {
    return <CircularProgress />;
  }

  const commitAndPush = async (commitMessage) => {
    if (!commitMessage) {
      toast.error("Please enter message");
      return
    }
    setLoading(true)
    commitAll({ message: commitMessage })
      .then(async () => {
        await pushCurrentBranchToOrigin();
        setLoading(false)
        setCommitMessage("");
      })
      .catch((e) => {
        setLoading(false)
        toast.error(e.message);
      });
  };

  const gitFolderPath = path.join(projectRoot, ".git");
  const handleRemoveGitFolder = async () => {
    console.log(`gitFolderPath: ${gitFolderPath}`);
    console.log(`Type of gitFolderPath: ${typeof gitFolderPath}`);
    if (!(await existsPath(gitFolderPath))) {
      console.log(`Directory ${gitFolderPath} does not exist.`);
      return;
    }
    if (typeof gitFolderPath !== 'string') {
      console.error('Error: gitFolderPath is not a string');
      return;
    }

    console.log(`Attempting to remove git folder at: ${gitFolderPath}`);
    await removeDirectory(gitFolderPath);
    console.log(`Removal attempt completed. Now listing remaining files.`);
    let list = await getAllFileNames(projectRoot);
    console.log(list, "Remaining files after removal:");
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
                onClick={() => commitAndPush(commitMessage)}
                data-testid="commit-all-button"
                loading={loading}
              >
                Sync All
              </ArLoadingButton>
              <ArLoadingButton
                variant="contained"
                size="small"
                onClick={handleRemoveGitFolder}
                data-testid="remove-git-folder-button"
              >
                Unlink
              </ArLoadingButton>
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
