/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-01 17:05:34
 */
import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import format from "date-fns/format";
import path from "path";
import { useGitRepo, useFileStore } from "store"; // Adjust the path as necessary
import { getFileHistoryWithDiff } from "domain/git";

const FileHistory = () => {
  const { projectRoot, filepath, saveFile } = useFileStore((state) => ({
    projectRoot: state.currentProjectRoot,
    filepath: state.filepath,
    saveFile: state.saveFile,
  }));
  const { currentBranch } = useGitRepo((state) => ({
    currentBranch: state.currentBranch,
  }));

  const [currentHistory, setCurrentHistory] = useState([]);

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

      setCurrentHistory(formattedHistory);
    };

    fetchHistory();
  }, [filepath, projectRoot, currentBranch]);

  if (!filepath) {
    return <div>File not selected</div>;
  }

  return (
    <div>
      <Typography variant="body1" className="mb-2">
        {projectRoot}: {path.relative(projectRoot, filepath)} on {currentBranch}
      </Typography>
      <hr className="my-2" />
      {currentHistory?.map((h) => (
        <Card key={h.commitId} className="mb-4">
          <CardContent>
            <div className="flex items-center">
              <Typography variant="body2" className="mb-2 mr-2">
                {h.timestamp ? format(h.timestamp * 1000, "MM/dd-HH:mm") : ""}
                &nbsp;|&nbsp;{h.message}
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={() => saveFile(filepath, h.content, true)}
                className="mb-2"
              >
                Checkout
              </Button>
            </div>
            <pre className="bp3-code-block">
              <code>{h.diffText}</code>
            </pre>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FileHistory;
