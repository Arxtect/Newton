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

export async function getYDocToken(room) {
  const response = await apiFetch(getApiUrl(`/auth/token/${room}`), "GET");
  return response;
}

//UpdateUserAccess
export async function inviteUser({email, share_link, project_name, access}) {
  const response = await apiFetch(getApiUrl("/room/share/user"), "PUT", {
    email,
    share_link,
    project_name, //(project+userid)
    access, //权限（值：r、rw）
  });
  return response;
}

export async function deleteInviteUser({ email, project_name }) {
  const response = await apiFetch(getApiUrl("/room/share/user"), "DELETE", {
    email,
    project_name, //(project+userid)
  });
  return response;
}

export async function closeRoom({
  project_name,
}) {
  const response = await apiFetch(getApiUrl("/room/share"), "DELETE", {
    project_name, //(project+userid)
  });
  return response;
}


export async function getRoomInfoList({ project_name }) {
  const response = await apiFetch(
    getApiUrl(`/room/share/${project_name}`),
    "GET"
  );
  return response;
}

export async function getRoomUserAccess({ project_name }) {
  const response = await apiFetch(
    getApiUrl(`/room/share/user/${project_name}`),
    "GET",
  );
  return response;
}

export async function reopenRoom({ project_name }) {
  const response = await apiFetch(getApiUrl("/room/share/reopen"), "POST", {
    project_name, //(project+userid)
  });
  return response;
}


export async function checkHealth() {
  const response = await apiFetch(getApiUrl("/healthcheck"), "GET");
  return response;
}