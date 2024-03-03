import React, { useState, useEffect } from "react";
import { isFastForward } from "domain/git";
import { Select, MenuItem, Button, Typography } from "@mui/material";

const MergeManager = ({
  projectRoot,
  branches,
  remotes,
  currentBranch,
  remoteBranches,
  onMerge,
}) => {
  const [theirs, setTheirs] = useState(currentBranch);
  const [mergeable, setMergeable] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkFastForward = async () => {
      try {
        const ret = await isFastForward(projectRoot, currentBranch, theirs);
        setMergeable(ret.fastForward && !ret.self);
        setError(null); // Reset error state on successful check
      } catch (error) {
        setError("Error checking mergeability"); // Set error state if there's an error
      }
    };

    checkFastForward();
  }, [projectRoot, currentBranch, theirs]);

  const mergeBranches = [...branches, ...remoteBranches];

  return (
    <div className="my-2">
      <div>
        Merge ours: [{currentBranch}] : theirs:
        <Select
          value={theirs}
          onChange={(e) => {
            const newTheirs = e.target.value;
            setTheirs(newTheirs);
          }}
          style={{ marginLeft: "8px", marginRight: "8px" }}
          labelId="simple-select-outlined-label"
          className="text-xs p-0 overflow-hidden"
          size="small"
        >
          {mergeBranches.map((b) => (
            <MenuItem key={b} value={b}>
              {b}
            </MenuItem>
          ))}
        </Select>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => onMerge(currentBranch, theirs)}
          disabled={!mergeable}
        >
          exec
        </Button>
        {!mergeable && (
          <Typography color="warning" className="inline-block ml-[8px]">
            (fast forward only)
          </Typography>
        )}
        {error && (
          <Typography color="error" className="inline-block ml-[8px]">
            {error}
          </Typography>
        )}
      </div>
    </div>
  );
};

export default MergeManager;
