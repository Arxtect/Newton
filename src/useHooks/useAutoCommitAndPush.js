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
    }, 30000); // 30 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [hasChanges, commitAndPush]);
};
