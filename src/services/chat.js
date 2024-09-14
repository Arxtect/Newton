/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-08-06 16:21:43
 */
import {apiFetch} from "./apiFetch.js"

// 辅助函数：生成带有统一前缀的URL
function getApiUrl(endpoint) {
  return `/api/v1/chat${endpoint}`;
}

export async function getChatApp() {
  const response = await apiFetch(getApiUrl("/app"), "GET");
  return response;
}

export async function getChatAccessToken(access_token) {
  const response = await apiFetch(
    getApiUrl("/access_token?access_token=" + access_token),
    "GET"
  );
  return response?.access_token;
}

export async function stopChat(task_id,token) {
  const response = await apiFetch(
    getApiUrl(`/chat-messages/${task_id}/stop`),
    "POST",
    null,
    {
      headers: {
        "APP-Authorization": "Bearer " + token,
      },
    }
  );
  return response;
}

