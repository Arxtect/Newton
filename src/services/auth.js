// 假设你有这些辅助函数
import { setCookie, deleteCookie } from "@/util";
import { toast } from "react-toastify"; // 假设你已经安装了react-toastify
import { updateAccessToken } from "store";

// 辅助函数：生成带有统一前缀的URL
function getApiUrl(endpoint) {
  return `/api/v1${endpoint}`;
}

// 注册用户
export async function registerUser(userData) {
  const response = await fetch(getApiUrl("/auth/register"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    const data = await response.json();
    console.log(data);
    throw new Error(`register failed: ${data.message}`);
  }
}

// 登录用户
export async function loginUser(credentials) {
  const response = await fetch(getApiUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
    credentials: "include",
  });

  if (response.ok) {
    const data = await response.json();
    // setCookie("mojolicious", data.access_token, 30000);
    updateAccessToken(data.access_token);
    return data;
  } else {
    throw new Error("Login failed");
  }
}

// 刷新 token
export async function refreshAuth() {
  try {
    const response = await fetch(getApiUrl("/auth/refresh"), {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to refresh token");
    }

    const data = await response.json();
    // setCookie("mojolicious", data.access_token, 30000);
    updateAccessToken(data.access_token);
  } catch (error) {
    // toast.error("Login has expired. Please log in again", {
    //   position: "top-right",
    // });
    // deleteCookie("mojolicious");
    updateAccessToken("");
    setTimeout(() => {
      //   window.location.reload();
    }, 1500);
  }
}

// 登出用户
export async function logoutUser() {
  const response = await fetch(getApiUrl("/auth/logout"), {
    method: "GET",
    credentials: "include",
  });

  if (response.ok) {
    // deleteCookie("mojolicious");
    updateAccessToken("");
  } else {
    throw new Error("Logout failed");
  }
}

// 获取用户信息
export async function getMe() {
  await refreshAuth();
  const response = await fetch(getApiUrl("/users/me"), {
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
    // toast.error("Login has expired. Please log in again", {
    //   position: "top-right",
    // });
  } else {
    throw new Error("Failed to fetch user information");
  }
}

// 验证邮箱
export async function verifyEmail(verificationCode) {
  const response = await fetch(
    getApiUrl(`/auth/verifyemail/${verificationCode}`),
    {
      method: "GET", // 默认为GET，可以省略
      credentials: "include",
    }
  );

  if (response.ok) {
    return response.json();
  } else if (response.status === 401) {
    // deleteCookie("mojolicious");
    updateAccessToken("");
    toast.error("Login has expired. Please log in again", {
      position: "top-right",
    });
  } else {
    throw new Error("Email verification failed");
  }
}

// 忘记密码
export async function forgotPassword(email) {
  const response = await fetch(getApiUrl("/auth/forgotpassword"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email }),
  });
  console.log(response, "response");
  if (response.ok) {
    return response.json();
  } else if (response.status === 401) {
    // deleteCookie("mojolicious");
    updateAccessToken("");
    toast.error("Login has expired. Please log in again", {
      position: "top-right",
    });
  } else {
    throw new Error("Password reset request failed");
  }
}

// 重置密码
export async function resetPassword({ resetToken, password, passwordConfirm }) {
  const response = await fetch(getApiUrl(`/auth/resetpassword/${resetToken}`), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password, passwordConfirm }),
    credentials: "include",
  });

  if (response.ok) {
    return response.json();
  } else if (response.status === 401) {
    // deleteCookie("mojolicious");
    updateAccessToken("");
    toast.error("Login has expired. Please log in again", {
      position: "top-right",
    });
  } else {
    throw new Error("Password reset failed");
  }
}
