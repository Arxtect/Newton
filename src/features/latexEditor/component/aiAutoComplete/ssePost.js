import { toast } from "react-toastify";

const ContentType = {
  json: "application/json",
  stream: "text/event-stream",
  audio: "audio/mpeg",
  form: "application/x-www-form-urlencoded; charset=UTF-8",
  download: "application/octet-stream", // for download
  upload: "multipart/form-data", // for upload
};

const baseOptions = {
  method: "GET",
  mode: "cors",
  credentials: "include",
  headers: new Headers({
    "Content-Type": ContentType.json,
  }),
  redirect: "follow",
};

function unicodeToChar(text) {
  if (!text) return "";

  console.log(text, "text");

  return text?.replace(/\\u[0-9a-f]{4}/g, (_match, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  });
}

export const ssePost = async (
  url,
  fetchOptions,
  { onSuccess, onError, getAbortController }
) => {
  const abortController = new AbortController();

  const options = Object.assign(
    {},
    baseOptions,
    {
      method: "POST",
      signal: abortController.signal,
    },
    fetchOptions
  );

  // 设置内容类型
  const contentType = options.headers.get("Content-Type");
  if (!contentType) options.headers.set("Content-Type", ContentType.json);

  // 处理请求体
  if (options.body) {
    options.body = JSON.stringify(options.body);
  }

  getAbortController?.(abortController);

  try {
    const urlWithPrefix = `${url.startsWith("/") ? url : `/${url}`}`;
    const response = await fetch(urlWithPrefix, options);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Request failed");
    }
    // 直接解析完整响应
    const responseData = await response.json();
    const suggestion = responseData?.data || {};

    if (suggestion) {
      onSuccess?.(unicodeToChar(suggestion));
    } else {
      throw new Error("Suggestion not found");
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      toast.error(error.message || "Request failed");
      onError?.(error.message);
    }
    throw error;
  }
};
