import React, { useState } from "react";
import {
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CommandWithInput from "@/components/commandWithInput";
import CommandWithSelect from "@/components/commandWithSelect";
import FetchManager from "./fetchManager";
import MergeManager from "./mergeManager";
import { useGitRepo, useFileStore } from "store";
import Typography from "@mui/material/Typography";

const BranchController = ({
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

  const { githubApiToken, corsProxy } = useGitRepo();
  // const { projectRoot } = useFileStore((state) => ({
  //   projectRoot: state.currentProjectRoot,
  // }));
  return (
    <div className="border border-gray-300 radius mt-3 ">
      <Accordion
        expanded={opened}
        onChange={() => setOpened(!opened)}
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
        >
          <Typography
            variant="caption"
            sx={{ fontSize: "0.75rem", lineHeight: "32px" }}
          >
            Branch[{currentBranch}]
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div className="w-full">
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
          <div className="w-full">
            <CommandWithInput
              description="Checkout new branch"
              validate={(value) =>
                value.length > 0 && !branches.includes(value)
              }
              onExec={onClickCreateBranch}
              placeholder={"commit message"}
            />
          </div>
          <div className="w-full">
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
              <div className="w-full">
                <FetchManager
                  projectRoot={projectRoot}
                  remotes={remotes}
                  corsProxy={corsProxy}
                  token={githubApiToken}
                />
              </div>
              <div className="w-full">
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
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default BranchController;
