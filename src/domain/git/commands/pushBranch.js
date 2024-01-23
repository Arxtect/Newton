import * as git from "isomorphic-git";

export async function pushBranch(projectRoot, remote, ref, token, corsProxy) {
  const ret = await git.push({
    dir: projectRoot,
    remote,
    ref,
    corsProxy,
    token,
  });

  if (ret.errors && ret.errors.length > 0) {
    console.log(ret.errors);
    throw new Error(ret.errors.join("|"));
  }
  return !!ret.ok;
}
