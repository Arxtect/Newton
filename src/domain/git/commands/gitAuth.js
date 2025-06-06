export const gitAuth = (token) => {
  if (!token) {
    token = "arxtect";
  }
  return {
    //  onAuth: () => ({
    //   password: token // 你的 GitHub API 令牌
    // }),
    headers: { Authorization: `${generateBasicAuthHeader(token)}` },
  };
};

function generateBasicAuthHeader(password) {
  const username = ""; // 空用户名
  const authString = `${username}:${password}`;
  const base64Encoded = btoa(authString);
  return `Basic ${base64Encoded}`;
}

export function getAuthor(user) {
  return {
    committer: {
      name: user.name || "arxtect",
      email: user.email || "arxtect@gmail.com",
    },
    author: {
      name: user.name || "arxtect",
      email: user.email || "arxtect@gmail.com",
    },
  };
}
