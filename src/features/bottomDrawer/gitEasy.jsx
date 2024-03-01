import React from "react";
import { Button } from "@blueprintjs/core";
import { useGitRepo } from "store";
import GitBriefHistory from "./gitBriefHistory";
import { toast } from "react-toastify";
import {
  getRemovableFilenames,
  getModifiedFilenames,
} from "domain/git/queries/parseStatusMatrix";
import fs from "fs";
import path from "path";
import pify from "pify";

const GitEasy = () => {
  const {
    projectRoot,
    githubApiToken,
    currentBranch,
    statusMatrix,
    corsProxy,
    remotes,
    setRemotes,
    // Assume additional actions for commitAll, initializeGitStatus are available
  } = useGitRepo((state) => ({
    projectRoot: state.projectRoot,
    githubApiToken: state.githubApiToken,
    currentBranch: state.currentBranch,
    statusMatrix: state.statusMatrix,
    corsProxy: state.corsProxy,
    remotes: state.remotes,
    setRemotes: state.setRemotes,
    // Additional actions
  }));

  const createGitHubRepository = async () => {
    const sp = projectRoot.split("/");
    const repoName = sp[sp.length - 1];
    const octokit = new Octokit({ auth: githubApiToken });

    try {
      const result = await octokit.repos.createForAuthenticatedUser({
        name: repoName,
      });

      const url = result.data.html_url;
      toast.success(`Repository created: ${url}`);

      const configPath = path.join(projectRoot, ".git/config");
      let config = await pify(fs.readFile)(configPath, "utf8");
      config += `\n[remote "origin"]\n`;
      config += `\turl = ${url}\n`;
      config += `\tfetch = +refs/heads/*:refs/remotes/origin/*\n`;

      await pify(fs.writeFile)(configPath, config);
      toast.success("Remote origin added to .git/config");

      // Assuming setRemotes is a function to update the Zustand store
      setRemotes([...remotes, { name: "origin", url }]);
    } catch (error) {
      toast.error(`Repository creation failed: ${error.message}`);
    }
  };

  const commitAndPushChanges = async () => {
    // Placeholder function, implement logic to commit and push changes
    // Use git and fs as needed, similar to the createGitHubRepository function
  };

  if (!statusMatrix) {
    return <span>Loading...</span>;
  }

  const removable = getRemovableFilenames(statusMatrix);
  const modified = getModifiedFilenames(statusMatrix).filter(
    (a) => !removable.includes(a)
  );
  const hasChanges = modified.length > 0 || removable.length > 0;
  const showCreateRepo = githubApiToken && remotes.length === 0;

  return (
    <div>
      {showCreateRepo && (
        <Button
          text="Create GitHub Repository"
          onClick={createGitHubRepository}
        />
      )}
      <hr />
      <h1>Changes</h1>
      <Button
        text="Commit All"
        disabled={!hasChanges}
        onClick={commitAndPushChanges}
        data-testid="commit-all-button"
      />
      {!hasChanges && <p>No Changes</p>}
      {hasChanges && (
        <>
          <div>
            {modified.map((filepath) => (
              <div key={filepath}>{filepath} (modified)</div>
            ))}
          </div>
          <div>
            {removable.map((filepath) => (
              <div key={filepath}>{filepath} (deleted)</div>
            ))}
          </div>
        </>
      )}
      <GitBriefHistory />
    </div>
  );
};

export default GitEasy;
