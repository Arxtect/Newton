import { diffLines } from "diff";
import * as git from "isomorphic-git";
import fs from "fs";
import { getFileStateChanges } from "domain/git";
export async function getHistoryWithChanges(dir, ref) {
  const commits = await git.log({fs, dir, ref});
  console.log(commits, "commits");
  const rawChanges = await Promise.all(
    commits.map(async (commit) => {
      const parentHash = commit.commit.parent[0];
      try {
          const changes = await getFileStateChanges(parentHash, commit.oid, dir);
          const fileWithChange = changes.filter((change) => change.type !== 'equal');
          return {
              fileWithChange,
              timestamp: commit.commit.committer?.timestamp,
              committerName: commit.commit.committer?.name,
              commitOid: commit.oid,
              commitParent: parentHash,
          };
      } catch (e) {
          console.error('Error processing commit:', e);
          return null;
      }
  })
  );
  console.log(rawChanges, "rawChanegs with fileChanegs");
  const historyVersions = rawChanges.filter((r) => r != null);
  return historyVersions
}

export async function getBlob(dir, oid, filepath) {
  console.log("getBlob");
  try {
    const { blob } = await git.readBlob({
      fs,
      dir,
      oid,
      filepath,
    });
    return blob;
  } catch (e) {
    return null;
  }
}

export async function getDiff(dir, parentOid, currentOid, filepath) {
  const parentBlob = await getBlob(dir, parentOid, filepath);
  const currentBlob = await getBlob(dir, currentOid, filepath);
  const parentRaw = parentBlob ? Buffer.from(parentBlob).toString('utf8') : ""; // 确保正确解码
  const currentRaw = currentBlob ? Buffer.from(currentBlob).toString('utf8') : ""; // 确保正确解码
  const diff = diffLines(parentRaw, currentRaw);
  console.log(diff, "diff");
  return diff;
}

// 获取文件的历史记录
export async function getFileHistory(dir, ref, filepath) {
  const commits = await git.log({ fs, dir, ref });
  console.log(commits, "commits");
  
  const rawChanges = await Promise.all(
    commits.map(async (commit) => {
      try {
        const { blob } = await git.readBlob({
          fs,
          dir,
          oid: commit.oid,
          filepath,
        });
        return {
          commit,
          blob: blob, // 直接使用 blob
        };
      } catch (e) {
        return null;
      }
    })
  );
  console.log(rawChanges, "rawChanges");
  const history = rawChanges.filter((r) => r != null).reverse();
  console.log(history, "history");
  const fileChanges = history.reduce((acc, current, index) => {
    const prev = history[index - 1];
    if (prev && prev.commit.oid !== current.commit.oid) {
      return [...acc, current];
    } else if (index === 0) {
      return [current];
    } else {
      return acc;
    }
  }, []);

  return fileChanges.filter((f) => f != null);
}

// 获取文件历史记录并计算差异
export async function getFileHistoryWithDiff(dir, ref, filepath) {
  const history = await getFileHistory(dir, ref, filepath);
  console.log(history, "history");
  return history.map((current, index) => {
    const prev = history[index - 1];
    const currentRaw = Buffer.from(current.blob).toString('utf8'); // 确保正确解码
    const prevRaw = prev == null ? "" : Buffer.from(prev.blob).toString('utf8'); // 确保正确解码
    const diff = diffLines(prevRaw, currentRaw);
    console.log(diff, "diff");
    return {
      ...current,
      diff,
    };
  });
}

