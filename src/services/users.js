/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-08-05 09:47:36
 */
// 假设你有这些辅助函数
import { toast } from "react-toastify"; // 假设你已经安装了react-toastify
import { updateAccessToken, updateUser } from "store";
import {apiFetch} from "./apiFetch.js"
import { refreshAuth } from "./auth";

// 辅助函数：生成带有统一前缀的URL
function getApiUrl(endpoint) {
  return `/api/v1/users${endpoint}`;
}

export async function getMe() {
  try {
    await refreshAuth();
    const response = await apiFetch(getApiUrl("/me"), "GET");
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getGitRepoList(page=1,limit=100) {
  try {
      await refreshAuth();
    const response = await apiFetch(getApiUrl(`/gitea/repoList?page=${page}&&limit=${limit}`), "GET");
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getGitToken(token="") {
  try {
      await refreshAuth();
    const response = await apiFetch(getApiUrl(`/gitea/token?token=${token}`), "GET");
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getGitTokenValidate(token) {
  try {
      await refreshAuth();
   const response = await apiFetch(getApiUrl(`/users/gitea/${token}/validate`), "GET")
    return response;
  } catch (error) {
    throw error;
  }

}

export async function createGitRepo(name, description, isPrivate = true) {
  try {
      await refreshAuth();
   const response = await apiFetch(getApiUrl("/gitea/repo"), "POST",  { name, description, private: isPrivate })
    return response;
  } catch (error) {
    throw error;
  }

}

export async function deleteGitRepo(name) {
  try {
    await refreshAuth();
    const response = await apiFetch(
      getApiUrl(`/gitea/repo/${name}`),
      "DELETE"
    );
    return response;
  } catch (error) {
    throw error;
  }
}