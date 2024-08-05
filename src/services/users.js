// 假设你有这些辅助函数
import { setCookie, deleteCookie } from "@/util";
import { toast } from "react-toastify"; // 假设你已经安装了react-toastify
import { updateAccessToken, updateUser } from "store";

// 辅助函数：生成带有统一前缀的URL
function getApiUrl(endpoint) {
  return `/api/v1/users${endpoint}`;
}

// 获取用户信息
export async function getMe() {
  const response = await fetch(getApiUrl("/me"), {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    return response.json();
  } else if (response.status === 401) {
    // deleteCookie("mojolicious");
    updateAccessToken("");
    updateUser({});
    // toast.error("Login has expired. Please log in again", {
    //   position: "top-right",
    // });
  } else {
    throw new Error("Failed to fetch user information");
  }
}

// 获取gitea repo list
export async function getGitRepoList(page=1,limit=100) {
  const response = await fetch(getApiUrl(`/gitea/repoList?page=${page}&&limit=${limit}`), {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    return response.json();
  } else if (response.status === 401) {
    updateAccessToken("");
    updateUser({});
    toast.error("Login has expired. Please log in again", {
      position: "top-right",
    });
  } else {
    throw new Error("Failed to fetch user information");
  }
}

export async function getGitToken(token="") {
  const response = await fetch(getApiUrl(`/gitea/token?token=${token}`), {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    return response.json();
  } else if (response.status === 401) {
    updateAccessToken("");
    updateUser({});
    toast.error("Login has expired. Please log in again", {
      position: "top-right",
    });
  } else {
    throw new Error("Failed to fetch user information");
  }
}

export async function getGitTokenValidate(token) {
  const response = await fetch(getApiUrl(`/users/gitea/${token}/validate`), {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    return response.json();
  } else if (response.status === 401) {
    updateAccessToken("");
    updateUser({});
    toast.error("Login has expired. Please log in again", {
      position: "top-right",
    });
  } else {
    throw new Error("Failed to fetch user information");
  }
}

export async function createGitRepo(name, description, isPrivate = true) {
  try {
    const response = await fetch(getApiUrl("/gitea/repo"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name, description, private: isPrivate }),
    });

    if (response.ok) {
      return response.json();
    } else if (response.status === 401) {
      updateAccessToken("");
      updateUser({});
      toast.error("Login has expired. Please log in again", {
        position: "top-right",
      });
      throw new Error("Unauthorized");
    } else {
      const errorDetail = await response.json();
      throw new Error(errorDetail.message || "Failed to create repository request");
    }
  } catch (error) {
    throw new Error(error.message || "Unknown error");
  }
}
