/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-08-06 11:37:31
 */
import { toast } from "react-toastify"; // 假设你已经安装了react-toastify
import { updateAccessToken, updateUser } from "store";

export async function apiFetch(url, method, body = null, options={}) {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      body: body ? JSON.stringify(body) : null,
    });

    if (response.ok) {
      return response.json();
    } else if (response.status === 401) {
      updateAccessToken("");
      updateUser({});
      toast.error("Login has expired. Please log in again", {
        position: "top-right",
      });
      // throw new Error("Unauthorized");
      toast.warning("Unauthorized");
    } else {
      const errorDetail = await response.json();
      toast.warning(errorDetail.message || "Failed to complete the request");
      // throw new Error(errorDetail.message || "Failed to complete the request");
    }
  } catch (error) {
    toast.warning(error.message || "Unknown error");
    // throw new Error(error.message || "Unknown error");
  }
}

