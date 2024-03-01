import React from "react";
import CommandWithInput from "@/components/commandWithInput";
import {
  getModifiedFilenames,
  getRemovableFilenames,
  getRemovedFilenames,
  getStagedFilenames,
} from "domain/git/queries/parseStatusMatrix";

const FileList = ({ title, files, actionLabel, onAction }) => (
  <>
    {files.length > 0 && <h5>{title}</h5>}
    {files.map((fname) => (
      <p key={fname}>
        {fname} :
        <button type="button" onClick={() => onAction(fname)}>
          {actionLabel}
        </button>
      </p>
    ))}
  </>
);

export function Staging(props) {
  const {
    statusMatrix,
    config,
    onClickReload,
    onClickGitAdd,
    onClickGitCommit,
    onClickGitRemove,
    onClickGitReset,
    onClickOpenConfig,
  } = props;

  if (!statusMatrix) {
    return (
      <div>
        <fieldset>
          <legend>Staging</legend>
          Git Status Loading...
        </fieldset>
      </div>
    );
  }

  const removable = getRemovableFilenames(statusMatrix);
  const removed = getRemovedFilenames(statusMatrix);
  const staged = getStagedFilenames(statusMatrix);
  const modified = getModifiedFilenames(statusMatrix).filter(
    (f) => !removable.includes(f) && !staged.includes(f) && !removed.includes(f)
  );

  const canCommit = staged.length > 0 || removed.length > 0;

  return (
    <div>
      <fieldset>
        <legend>Staging</legend>
        {canCommit && (
          <>
            <CommandWithInput
              description="Commit"
              validate={(value) => value.length > 0}
              onExec={onClickGitCommit}
            />
            {!config.committerName && !config.committerEmail && (
              <button type="button" onClick={onClickOpenConfig}>
                Set name/email by config
              </button>
            )}
          </>
        )}

        <FileList
          title="Staged"
          files={staged}
          actionLabel="Reset"
          onAction={onClickGitReset}
        />
        <FileList
          title="Removed"
          files={removed}
          actionLabel="Restore"
          onAction={onClickGitReset}
        />
        <FileList
          title="Modified"
          files={modified}
          actionLabel="Add to Stage"
          onAction={onClickGitAdd}
        />
        <FileList
          title="Deleted"
          files={removable}
          actionLabel="Remove from Git"
          onAction={onClickGitRemove}
        />
      </fieldset>
    </div>
  );
}
