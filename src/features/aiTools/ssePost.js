/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-12-27 11:40:42
 */
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
  credentials: "include", // always send cookies、HTTP Basic authentication.
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

const handleStream = (
  response,
  onData,
  onCompleted,
  onMessageEnd,
  onMessageReplace,
  onFile
) => {
  if (!response.ok) throw new Error("Network response was not ok");

  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let bufferObj;
  let isFirstMessage = true;

  function read() {
    let hasError = false;
    reader?.read().then((result) => {
      console.log(result, "result");
      if (result.done) {
        onCompleted && onCompleted();
        return;
      }
      buffer += decoder.decode(result.value, { stream: true });
      const lines = buffer.split("\n");
      console.log(lines, "lines");
      try {
        lines.forEach((message) => {
          console.log(message, "message");
          if (message) {
            // check if it starts with data:
            try {
              bufferObj = JSON.parse(message); // remove data: and parse as json
            } catch (e) {
              // mute handle message cut off
              onData("", isFirstMessage, {
                conversationId: bufferObj?.conversation_id,
                messageId: bufferObj?.message_id,
              });
              return;
            }
            if (bufferObj.status === 400 || !bufferObj.event) {
              onData("", false, {
                conversationId: undefined,
                messageId: "",
                errorMessage: bufferObj?.message,
                errorCode: bufferObj?.code,
              });
              hasError = true;
              onCompleted?.(true, bufferObj?.message);
              return;
            }
            if (
              bufferObj.event === "message" ||
              bufferObj.event === "agent_message"
            ) {
              // can not use format here. Because message is splited.
              onData(unicodeToChar(bufferObj.answer), isFirstMessage, {
                conversationId: bufferObj.conversation_id,
                taskId: bufferObj.task_id,
                messageId: bufferObj.id,
              });
              isFirstMessage = false;
            } else if (bufferObj.event === "message_file") {
              onFile?.(bufferObj);
            } else if (bufferObj.event === "message_end") {
              onMessageEnd?.(bufferObj);
            } else if (bufferObj.event === "message_replace") {
              onMessageReplace?.(bufferObj);
            }
          }
        });
        buffer = lines[lines.length - 1];
      } catch (e) {
        onData("", false, {
          conversationId: undefined,
          messageId: "",
          errorMessage: `${e}`,
        });
        hasError = true;
        onCompleted?.(true, e.toString());
        return;
      }
      console.log(buffer, "buffer");
      if (!hasError) read();
    });
  }
  read();
};

export const ssePost = (
  url,
  fetchOptions,
  {
    onData,
    onCompleted,
    onFile,
    onMessageEnd,
    onMessageReplace,
    onError,
    getAbortController,
  }
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

  const contentType = options.headers.get("Content-Type");
  if (!contentType) options.headers.set("Content-Type", ContentType.json);
  // options.headers.set("authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIxNWZmZDYxNS1iMDZmLTRjOGQtYmY3OS04MTlhNDA1NzI1OGYiLCJzdWIiOiJXZWIgQVBJIFBhc3Nwb3J0IiwiYXBwX2lkIjoiMTVmZmQ2MTUtYjA2Zi00YzhkLWJmNzktODE5YTQwNTcyNThmIiwiYXBwX2NvZGUiOiJ2TGN3RFJxb1VoTkVnQWpoIiwiZW5kX3VzZXJfaWQiOiI4YWEwNWU1Zi0xMWQyLTRlN2ItYmFjYy1jN2ZjMTkwZjQ2ZmYifQ.kCbfQxeBxZYM88gEC1NFmdVBWjDzwT4UL7WPihXZdPo");

  getAbortController?.(abortController);

  // const urlWithPrefix = "http://network.jancsitech.net:1510/api/chat-messages" || `${url.startsWith("/") ? url : `/${url}`}`;
  const urlWithPrefix = `${url.startsWith("/") ? url : `/${url}`}`;

  const { body } = options;
  if (body) options.body = JSON.stringify(body);

  fetch(urlWithPrefix, options)
    .then((res) => {
      if (!/^(2|3)\d{2}$/.test(String(res.status))) {
        res.json().then((data) => {
          toast.error(data.message || "Server Error");
          console.log(data, "data");
        });
        onError?.("Server Error");
        return;
      }
      return handleStream(
        res,
        (str, isFirstMessage, moreInfo) => {
          if (moreInfo.errorMessage) {
            onError?.(moreInfo.errorMessage, moreInfo.errorCode);
            if (
              moreInfo.errorMessage !==
              "AbortError: The user aborted a request."
            )
              //   Toast.notify({ type: "error", message: moreInfo.errorMessage });
              return;
          }
          onData?.(str, isFirstMessage, moreInfo);
        },
        onCompleted,
        onMessageEnd,
        onMessageReplace,
        onFile
      );
    })
    .catch((e) => {
      if (e.toString() !== "AbortError: The user aborted a request.")
        throw new Error(e);
      onError?.(e);
    });
};

// 辅助函数：生成带有统一前缀的URL
export function getChatApiUrl() {
  return `/api/v1/chat/chat-messages`;
}

export default ssePost;
