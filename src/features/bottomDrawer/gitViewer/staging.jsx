import React from "react";
import CommandWithInput from "@/components/commandWithInput";
import {
  getModifiedFilenames,
  getRemovableFilenames,
  getRemovedFilenames,
  getStagedFilenames,
} from "domain/git/queries/parseStatusMatrix";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const FileList = ({ title, files, actionLabel, onAction }) => (
  <>
    {files.length > 0 && <Typography variant="h7">{`[${title}]`}</Typography>}
    {files.map((fname) => (
      <p key={fname}>
        {fname} &nbsp;
        <Button variant="outlined" size="small" onClick={() => onAction(fname)}>
          {actionLabel}
        </Button>
      </p>
    ))}
  </>
);

export function Staging(props) {
  const {
    statusMatrix,
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
    <div className="border border-gray-300 radius mt-3">
      <Accordion
        defaultExpanded
        sx={{
          minHeight: 32,
          "& .Mui-expanded": {
            minHeight: "32px !important",
          },
          "& .MuiAccordionDetails-root": { padding: "0px 16px 16px" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
          sx={{
            minHeight: 32,
            "& .MuiAccordionSummary-content": { margin: "0px !important" },
            "& .MuiAccordionSummary-expandIconWrapper": { padding: "0px" },
          }}
          className="mh-0"
        >
          <Typography
            variant="caption"
            sx={{ fontSize: "0.75rem", lineHeight: "32px" }}
          >
            Staging
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div
            style={{
              fontFamily: "Inconsolata, monospace",
              fontSize: "0.75rem",
            }}
          >
            {canCommit && (
              <>
                <CommandWithInput
                  description="Commit"
                  validate={(value) => value.length > 0}
                  onExec={onClickGitCommit}
                />
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
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
