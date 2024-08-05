import * as Diff from "diff";
import * as git from "isomorphic-git";
import fs from "fs";

export async function getFileHistory(dir, ref, filepath) {
  const commits = await git.log({ fs,dir, ref });
  const rawChanges = await Promise.all(
    commits.map(async (commit) => {
      try {
        const blob = await git.readObject({
          fs,
          dir,
          oid: commit.oid,
          filepath,
        });
        return {
          commit,
          blob,
        };
      } catch (e) {
        return;
      }
    })
  );
  const history = rawChanges.filter((r) => r != null).reverse();

  const fileChanges = history.reduce(
    (acc, current, index) => {
      const prev = history[index - 1];
      if (prev && prev.blob.oid !== current.blob.oid) {
        return [...acc, current];
      } else {
        return acc;
      }
    },
    [history[0]]
  );

  return fileChanges.filter((f) => f != null);
}

export async function getFileHistoryWithDiff(dir, ref, filepath) {
  const history = await getFileHistory(dir, ref, filepath);
  return history.map((current, index) => {
    const prev = history[index - 1];
    const currentRaw = current.blob.object.toString();
    const prevRaw = prev == null ? "" : prev.blob.object.toString();
    const diff = Diff.diffLines(prevRaw, currentRaw);

    // const diff = diff3Merge(currentRaw, currentRaw, prevRaw)
    return {
      ...current,
      diff,
    };
  });
}
