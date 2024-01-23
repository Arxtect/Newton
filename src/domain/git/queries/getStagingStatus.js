import { getFileStatus } from "./getFileStatus";
import { getRepositoryFiles } from "./getRepositoryFiles";

export async function getStagingStatus(projectRoot, callback) {
  const relpaths = await getRepositoryFiles(projectRoot);

  const list = await Promise.all(
    relpaths.map(async (relpath) => {
      const status = await getFileStatus(projectRoot, relpath);
      const ret = { filepath: relpath, status };
      callback && callback(ret);
      return ret;
    })
  );

  return list.reduce((acc, { filepath, status }) => {
    return {
      ...acc,
      [filepath]: status,
    };
  }, {});
}
