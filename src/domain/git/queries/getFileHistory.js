import { diffLines } from "diff";
import * as git from "isomorphic-git";
import fs from "fs";

// 获取文件的历史记录
export async function getFileHistory(dir, ref, filepath) {
  const commits = await git.log({ fs, dir, ref });
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
  const history = rawChanges.filter((r) => r != null).reverse();

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
  return history.map((current, index) => {
    const prev = history[index - 1];
    const currentRaw = Buffer.from(current.blob).toString('utf8'); // 确保正确解码
    const prevRaw = prev == null ? "" : Buffer.from(prev.blob).toString('utf8'); // 确保正确解码
    const diff = diffLines(prevRaw, currentRaw);

    console.log(diff, prevRaw, currentRaw, prev, 'diff');

    return {
      ...current,
      diff,
    };
  });
}

