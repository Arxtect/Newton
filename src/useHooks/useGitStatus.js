import { useMemo } from "react";
import { useGitRepo } from "store";
import {
  getRemovableFilenames,
  getModifiedFilenames,
} from "domain/git/queries/parseStatusMatrix";

export const useGitStatus = () => {
  const { statusMatrix } = useGitRepo((state) => ({
    statusMatrix: state.statusMatrix,
  }));
  const removable = useMemo(
    () => getRemovableFilenames(statusMatrix),
    [statusMatrix]
  );
  const modified = useMemo(
    () => getModifiedFilenames(statusMatrix),
    [statusMatrix]
  );

  const hasChanges = useMemo(() => {
    console.log("modified", modified, "removable", removable);
    const nonRemovableModified = modified.filter(
      (file) => !removable.includes(file)
    );
    return nonRemovableModified.length > 0 || removable.length > 0;
  }, [modified, removable]);

  return { hasChanges, modified, removable };
};
