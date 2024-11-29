/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-11-29 14:17:15
 */
import { useEffect } from "react";
import { useGitStatus, useCommitAndPush } from "@/useHooks";

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
