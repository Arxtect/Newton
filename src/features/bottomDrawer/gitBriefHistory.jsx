/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import React, { useState } from "react";
import Button from "@mui/material/Button";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Typography from "@mui/material/Typography";
import format from "date-fns/format";
import { useGitRepo } from "store";

const GitBriefHistory = () => {
  const { currentBranch, history } = useGitRepo((state) => ({
    currentBranch: state.currentBranch,
    history: state.history,
  }));
  const [expanded, setExpanded] = useState(true);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="border border-gray-300 radius mt-3">
      <Accordion
        expanded={expanded}
        onChange={toggleExpand}
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
            History[{currentBranch}]
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div
            style={{
              fontFamily: "Inconsolata, monospace",
              fontSize: "0.75rem",
            }}
          >
            {history.map((description) => {
              console.log(description, "description");
              const name = description.commit?.author?.name || "<anonymous>";
              const message =
                description.commit?.message || description.message;
              const formatted = description?.commit?.author
                ? format(
                    description.commit?.author?.timestamp * 1000,
                    "MM/dd HH:mm"
                  )
                : "<none>";
              return (
                <div key={description.oid}>
                  {description.oid.slice(0, 7)} | {formatted} | {name} |{" "}
                  {message}
                </div>
              );
            })}
          </div>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default GitBriefHistory;
