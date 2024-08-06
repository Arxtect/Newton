import { toast } from "react-toastify"; // 假设你已经安装了react-toastify
import { updateAccessToken, updateUser } from "store";

export async function apiFetch(url, method, body = null) {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
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
      throw new Error("Unauthorized");
    } else {
      const errorDetail = await response.json();
      throw new Error(errorDetail.message || "Failed to complete the request");
    }
  } catch (error) {
    throw new Error(error.message || "Unknown error");
  }
}

