import { useEffect } from "react";
import { useGitStatus, useCommitAndPush } from "./";

export const useAutoCommitAndPush = () => {
  const { hasChanges } = useGitStatus();
  const commitAndPush = useCommitAndPush();

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (hasChanges) {
        commitAndPush();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [hasChanges, commitAndPush]);
};
