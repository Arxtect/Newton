/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-08-05 09:47:36
 */
import { apiFetch } from "./apiFetch.js";
import { refreshAuth } from "./auth.js";

// 辅助函数：生成带有统一前缀的URL
function getApiUrl(endpoint) {
  return `/api/v1/project${endpoint}`;
}

export async function getProjectViaId(id) {
  try {
    await refreshAuth();
    const response = await apiFetch(getApiUrl(`/get/id/${id}`), "GET");
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getProjectViaOwner() {
  try {
    await refreshAuth();
    const response = await apiFetch(getApiUrl(`/get/owner_id`), "GET");
    return response;
  } catch (error) {
    throw error;
  }
}

export async function createProject(
  project_name,
  share_link,
  room_name,
  email,
  is_sync = false
) {
  try {
    await refreshAuth();
    const response = await apiFetch(getApiUrl("/create"), "POST", {
      project_name,
      share_link,
      room_name,
      email,
      is_sync,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function UpdateProject(
  id,
  project_name,
  share_link,
  room_name,
  email,
  is_sync = false
) {
  try {
    await refreshAuth();
    const response = await apiFetch(getApiUrl(`/update/${id}`), "POST", {
      project_name,
      share_link,
      room_name,
      email,
      is_sync,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function deleteProject(id) {
  try {
    await refreshAuth();
    const response = await apiFetch(getApiUrl(`/delete/${id}`), "DELETE");
    return response;
  } catch (error) {
    throw error;
  }
}
