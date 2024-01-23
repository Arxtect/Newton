import { getFileStatus } from "./getFileStatus";

export async function isIgnored(root, relpath) {
  const status = await getFileStatus(root, relpath);
  return status === "ignored";
}
