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
  return response.token;
}
