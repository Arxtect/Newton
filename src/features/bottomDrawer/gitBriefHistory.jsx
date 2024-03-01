/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-03-01 16:58:19
 */
import React, { useState } from "react";
import { Button } from "@blueprintjs/core";
import format from "date-fns/format";
import { useGitRepo } from "store";

const GitBriefHistory = () => {
  const { currentBranch, history } = useGitRepo((state) => ({
    currentBranch: state.git.currentBranch,
    history: state.git.history,
  }));
  const [opened, setOpened] = useState(true);

  return (
    <div>
      <fieldset>
        <legend style={{ userSelect: "none", cursor: "pointer" }}>
          <Button
            minimal
            icon={opened ? "minus" : "plus"}
            onClick={() => setOpened(!opened)}
          />
          History[{currentBranch}]
        </legend>
        {opened && (
          <div style={{ fontFamily: "Inconsolata, monospace" }}>
            {history.map((description) => {
              const name = description.committer?.name || "<anonymous>";
              const message = description.error?.message || description.message;
              const formatted = description.author
                ? format(description.author.timestamp * 1000, "MM/DD HH:mm")
                : "<none>";
              return (
                <div key={description.oid}>
                  {description.oid.slice(0, 7)} | {formatted} | {name} |{" "}
                  {message}
                </div>
              );
            })}
          </div>
        )}
      </fieldset>
    </div>
  );
};

export default GitBriefHistory;
