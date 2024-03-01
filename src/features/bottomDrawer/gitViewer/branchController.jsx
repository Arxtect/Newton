import React, { useState } from "react";
import { Button } from "@blueprintjs/core";
import CommandWithInput from "@/components/commandWithInput";
import CommandWithSelect from "@/components/commandWithSelect";
import FetchManager from "./fetchManager";
import MergeManager from "./mergeManager";

const BranchController = ({
  config,
  projectRoot,
  currentBranch,
  branches,
  remotes,
  remoteBranches,
  onChangeBranch,
  onClickCreateBranch,
  onClickGitPush,
  onClickOpenConfig,
  onClickMerge,
}) => {
  const [opened, setOpened] = useState(true);

  return (
    <fieldset>
      <legend style={{ userSelect: "none", cursor: "pointer" }}>
        <Button
          minimal
          icon={opened ? "minus" : "plus"}
          onClick={() => setOpened(!opened)}
        />
        Branch
      </legend>
      {opened && (
        <>
          <div>
            <CommandWithSelect
              key={currentBranch}
              description="Checkout"
              tooltip={(value) => `git checkout ${value}`}
              validate={(value) => value !== currentBranch}
              initialValue={currentBranch}
              options={branches}
              onExec={onChangeBranch}
            />
          </div>
          <div>
            <CommandWithInput
              description="Checkout new branch"
              validate={(value) =>
                value.length > 0 && !branches.includes(value)
              }
              onExec={onClickCreateBranch}
            />
          </div>
          <div>
            <MergeManager
              currentBranch={currentBranch}
              remoteBranches={remoteBranches}
              projectRoot={projectRoot}
              branches={branches}
              remotes={remotes}
              onMerge={onClickMerge}
            />
          </div>
          {remotes.length > 0 && (
            <>
              <hr />
              {!config.githubApiToken && (
                <button onClick={onClickOpenConfig}>
                  Set github API Token
                </button>
              )}
              <div>
                <FetchManager
                  projectRoot={projectRoot}
                  remotes={remotes}
                  corsProxy={config.corsProxy}
                  token={config.githubApiToken}
                />
              </div>
              <div>
                <CommandWithSelect
                  key={currentBranch}
                  description="Push to origin"
                  options={branches}
                  initialValue={currentBranch}
                  tooltip={(value) => `git push origin ${value}`}
                  onExec={onClickGitPush}
                />
              </div>
            </>
          )}
        </>
      )}
    </fieldset>
  );
};

export default BranchController;
