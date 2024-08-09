/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-08-06 16:21:43
 */
import {apiFetch} from "./apiFetch.js"

// 辅助函数：生成带有统一前缀的URL
function getApiUrl(endpoint) {
  return `/api/v1/yredis${endpoint}`;
}

export async function getYDocToken() {
  const response = await apiFetch(getApiUrl("/auth/token"), "GET");
  return response?.token;
}

export async function inviteUser({email, share_link, project_name, access}) {
  const response = await apiFetch(getApiUrl("/room/share/user"), "PUT", {
    email,
    share_link,
    project_name, //(project+userid)
    access, //权限（值：r、rw）
  });
  return response?.status;
}

export async function deleteInviteUser({ email, project_name }) {
  const response = await apiFetch(getApiUrl("/room/share/user"), "DELETE", {
    email,
    project_name, //(project+userid)
  });
  return response?.status;
}

export async function deleteRoom({
  project_name,
}) {
  const response = await apiFetch(getApiUrl("/room/share"), "DELETE", {
    project_name, //(project+userid)
  });
  return response?.status;
}

export async function getRoomInfo({ project_name }) {
  const response = await apiFetch(getApiUrl("/room/share"), "GET", {
    project_name, //(project+userid)
  });
  return response;
}
