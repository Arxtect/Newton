import React, { useState, useEffect } from "react";
import { isFastForward } from "domain/git";

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

  useEffect(() => {
    const checkFastForward = async () => {
      const ret = await isFastForward(projectRoot, currentBranch, theirs);
      setMergeable(ret.fastForward && !ret.self);
    };

    checkFastForward();
  }, [projectRoot, currentBranch, theirs]);

  const mergeBranches = [...branches, ...remoteBranches];

  return (
    <div>
      <div>
        Merge ours: [{currentBranch}] : theirs:
        <select
          value={theirs}
          onChange={async (e) => {
            const newTheirs = e.target.value;
            setTheirs(newTheirs);
          }}
        >
          {mergeBranches.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        &nbsp;
        <button
          disabled={!mergeable}
          onClick={() => onMerge(currentBranch, theirs)}
        >
          exec
        </button>
        {!mergeable && <span>(fast forward only)</span>}
      </div>
    </div>
  );
};

export default MergeManager;
