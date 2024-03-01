/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-03-01 17:05:34
 */
import React, { useEffect } from "react";
import { Button, Card } from "@blueprintjs/core";
import format from "date-fns/format";
import path from "path";
import { useGitRepo } from "./yourStorePath"; // Adjust the path as necessary
import { getFileHistoryWithDiff } from "domain/git";

const FileHistory = () => {
  const {
    filepath,
    currentBranch,
    projectRoot,
    history,
    setHistory,
    saveFile,
  } = useGitRepo((state) => ({
    filepath: state.filepath,
    currentBranch: state.currentBranch,
    projectRoot: state.projectRoot,
    history: state.history,
    setHistory: state.setHistory,
    saveFile: state.saveFile,
  }));

  useEffect(() => {
    const fetchHistory = async () => {
      if (!filepath) return;

      const relpath = path.relative(projectRoot, filepath);
      const changeHistory = await getFileHistoryWithDiff(
        projectRoot,
        currentBranch,
        relpath
      );

      const formattedHistory = changeHistory
        .map((c) => ({
          message: c.commit.message,
          commitId: c.commit.oid,
          blobId: c.blob.oid,
          timestamp: c.commit.committer.timestamp,
          content: c.blob.object.toString(),
          diffText: c.diff
            .filter((d) => d.added || d.removed)
            .map((d) =>
              d.added
                ? `+ : ${d.value}`
                : d.removed
                ? `- : ${d.value}`
                : d.value
            )
            .join("\n"),
        }))
        .reverse();

      setHistory(formattedHistory);
    };

    fetchHistory();
  }, [filepath, projectRoot, currentBranch, setHistory]);

  if (!filepath) {
    return <div>File not selected</div>;
  }

  return (
    <div style={{ padding: 10 }}>
      {projectRoot}: {path.relative(projectRoot, filepath)} on {currentBranch}
      <hr />
      {history.map((h) => (
        <Card key={h.commitId}>
          <div>
            {format(h.timestamp * 1000, "MM/DD-HH:mm")}
            |&nbsp;
            {h.message}
            &nbsp;
            <Button
              onClick={() => saveFile(filepath, h.content, true)}
              text="Checkout"
            />
          </div>
          <pre className="bp3-code-block">
            <code>{h.diffText}</code>
          </pre>
        </Card>
      ))}
    </div>
  );
};

export default FileHistory;
