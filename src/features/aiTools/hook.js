/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-08-26 09:46:06
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { produce, setAutoFreeze } from "immer";
import { ssePost } from "./ssePost";
import { useTimestamp } from "@/useHooks";
import { getChatAccessToken, getChatApp } from "@/services";
import { chatAccessToken, updateChatAccessToken } from "@/store";
export const TransferMethod = {
  all: "all",
  local_file: "local_file",
  remote_url: "remote_url",
};

const getAppList = async () => {
  let list = await getChatApp();
  return list;
};

const getAccessTokenAndStore = async (token) => {
  if (chatAccessToken[token]) return chatAccessToken[token];
  let accessToken = await getChatAccessToken(token);
  updateChatAccessToken(token, accessToken);
  return accessToken;
};

export const useChat = (prevChatList, stopChat) => {
  const { formatTime } = useTimestamp();
  const connversationId = useRef("");
  const hasStopResponded = useRef(false);
  const [isResponding, setIsResponding] = useState(false);
  const isRespondingRef = useRef(false);
  const [chatList, setChatList] = useState(prevChatList || []);
  const chatListRef = useRef(prevChatList || []);
  const taskIdRef = useRef("");
  const conversationMessagesAbortControllerRef = useRef(null);

  const [appList, setAppList] = useState([]);
  const [currentApp, setCurrentApp] = useState(null);
  const [currentAppToken, setCurrentAppToken] = useState(null);

  const [lastMessage, setLastMessage] = useState("");

  const handleGetAppList = useCallback(() => {
    getAppList().then((res) => {
      setAppList(res);
      setCurrentApp(res.find((item) => item.default) || res[0]);
    });
  }, []);

  const handleGetAccessToken = useCallback(async (token) => {
    console.log(token, "token");
    let res = await getAccessTokenAndStore(token);
    console.log(res, "token");
    setCurrentAppToken(res);
  }, []);

  useEffect(() => {
    if (!currentApp) return;
    console.log(currentApp, "currentApp");
    handleGetAccessToken(currentApp.access_token);
  }, [currentApp]);

  useEffect(() => {
    handleGetAppList();
  }, []);

  useEffect(() => {
    setAutoFreeze(false);
    return () => {
      setAutoFreeze(true);
    };
  }, []);

  const handleUpdateChatList = useCallback((newChatList) => {
    setChatList(newChatList);
    chatListRef.current = newChatList;
  }, []);

  const handleResponding = useCallback((isResponding) => {
    setIsResponding(isResponding);
    isRespondingRef.current = isResponding;
  }, []);

  const handleStop = useCallback(() => {
    hasStopResponded.current = true;
    handleResponding(false);
    console.log(stopChat, taskIdRef.current, "stopChat && taskIdRef.current");

    if (stopChat && taskIdRef.current)
      stopChat(taskIdRef.current, currentAppToken);
    if (conversationMessagesAbortControllerRef.current)
      conversationMessagesAbortControllerRef.current.abort();
  }, [stopChat, handleResponding, currentAppToken]);

  const handleRestart = useCallback(() => {
    connversationId.current = "";
    taskIdRef.current = "";
    handleStop();
    const newChatList = [];
    handleUpdateChatList(newChatList);
    setLastMessage("");
  }, [handleStop, handleUpdateChatList]);

  const updateCurrentQA = useCallback(
    ({ responseItem, questionId, placeholderAnswerId, questionItem }) => {
      const newListWithAnswer = produce(
        chatListRef.current.filter(
          (item) =>
            item.id !== responseItem.id && item.id !== placeholderAnswerId
        ),
        (draft) => {
          if (!draft.find((item) => item.id === questionId))
            draft.push({ ...questionItem });

          draft.push({ ...responseItem });
        }
      );
      handleUpdateChatList(newListWithAnswer);
    },
    [handleUpdateChatList]
  );

  const handleSend = useCallback(
    async (
      url,
      data,
      { onGetConvesationMessages, onConversationComplete, currentAppToken }
    ) => {
      const questionId = `question-${Date.now()}`;
      const questionItem = {
        id: questionId,
        content: data.query,
        isAnswer: false,
        message_files: data.files,
      };

      const placeholderAnswerId = `answer-placeholder-${Date.now()}`;
      const placeholderAnswerItem = {
        id: placeholderAnswerId,
        content: "",
        isAnswer: true,
      };

      const newList = [
        ...chatListRef.current,
        questionItem,
        placeholderAnswerItem,
      ];
      handleUpdateChatList(newList);

      // answer
      const responseItem = {
        id: placeholderAnswerId,
        content: "",
        agent_thoughts: [],
        message_files: [],
        isAnswer: true,
      };

      handleResponding(true);
      hasStopResponded.current = false;

      console.log(data, "input");

      const bodyParams = {
        response_mode: "streaming",
        conversation_id: connversationId.current,
        ...data,
      };
      if (bodyParams?.files?.length) {
        bodyParams.files = bodyParams.files.map((item) => {
          if (item.transfer_method === TransferMethod.local_file) {
            return {
              ...item,
              url: "",
            };
          }
          return item;
        });
      }

      let hasSetResponseId = false;

      console.log(currentAppToken, "token");

      ssePost(
        url,
        {
          body: bodyParams,
          headers: new Headers({
            "APP-Authorization": `Bearer ${currentAppToken}`,
          }),
        },
        {
          onData: (
            message,
            isFirstMessage,
            { conversationId: newConversationId, messageId, taskId }
          ) => {
            responseItem.content = responseItem.content + message;
            setLastMessage((prevMessage) => prevMessage + message); // 累加消息

            if (messageId && !hasSetResponseId) {
              responseItem.id = messageId;
              hasSetResponseId = true;
            }

            if (isFirstMessage && newConversationId)
              connversationId.current = newConversationId;

            taskIdRef.current = taskId;
            if (messageId) responseItem.id = messageId;

            updateCurrentQA({
              responseItem,
              questionId,
              placeholderAnswerId,
              questionItem,
            });
          },
          async onCompleted(hasError) {
            handleResponding(false);

            if (hasError) return;

            if (onConversationComplete)
              onConversationComplete(connversationId.current);

            if (
              connversationId.current &&
              !hasStopResponded.current &&
              onGetConvesationMessages
            ) {
              const { data } = await onGetConvesationMessages(
                connversationId.current,
                (newAbortController) =>
                  (conversationMessagesAbortControllerRef.current =
                    newAbortController)
              );
              const newResponseItem = data.find(
                (item) => item.id === responseItem.id
              );
              if (!newResponseItem) return;

              const newChatList = produce(chatListRef.current, (draft) => {
                const index = draft.findIndex(
                  (item) => item.id === responseItem.id
                );
                if (index !== -1) {
                  const requestion = draft[index - 1];
                  draft[index - 1] = {
                    ...requestion,
                  };
                  draft[index] = {
                    ...draft[index],
                    content: newResponseItem.answer,
                    log: [
                      ...newResponseItem.message,
                      ...(newResponseItem.message[
                        newResponseItem.message.length - 1
                      ].role !== "assistant"
                        ? [
                            {
                              role: "assistant",
                              text: newResponseItem.answer,
                              files:
                                newResponseItem.message_files?.filter(
                                  (file) => file.belongs_to === "assistant"
                                ) || [],
                            },
                          ]
                        : []),
                    ],
                    more: {
                      time: formatTime(newResponseItem.created_at, "hh:mm A"),
                      tokens:
                        newResponseItem.answer_tokens +
                        newResponseItem.message_tokens,
                      latency:
                        newResponseItem.provider_response_latency.toFixed(2),
                    },
                    // for agent log
                    conversationId: connversationId.current,
                    input: {
                      inputs: newResponseItem.inputs,
                      query: newResponseItem.query,
                    },
                  };
                }
              });
              handleUpdateChatList(newChatList);
            }
          },
          // onFile(file) {
          //   const lastThought = responseItem.agent_thoughts?.[responseItem.agent_thoughts?.length - 1];
          //   if (lastThought)
          //     responseItem.agent_thoughts![responseItem.agent_thoughts!.length - 1].message_files = [...(lastThought).message_files, file];

          //   updateCurrentQA({
          //     responseItem,
          //     questionId,
          //     placeholderAnswerId,
          //     questionItem,
          //   });
          // },

          onMessageEnd: (messageEnd) => {
            if (messageEnd.metadata?.annotation_reply) {
              responseItem.id = messageEnd.id;
              responseItem.annotation = {
                id: messageEnd.metadata.annotation_reply.id,
                authorName: messageEnd.metadata.annotation_reply.account.name,
              };
              const baseState = chatListRef.current.filter(
                (item) =>
                  item.id !== responseItem.id && item.id !== placeholderAnswerId
              );
              const newListWithAnswer = produce(baseState, (draft) => {
                if (!draft.find((item) => item.id === questionId))
                  draft.push({ ...questionItem });

                draft.push({
                  ...responseItem,
                });
              });
              handleUpdateChatList(newListWithAnswer);
              return;
            }
            responseItem.citation =
              messageEnd.metadata?.retriever_resources || [];

            const newListWithAnswer = produce(
              chatListRef.current.filter(
                (item) =>
                  item.id !== responseItem.id && item.id !== placeholderAnswerId
              ),
              (draft) => {
                if (!draft.find((item) => item.id === questionId))
                  draft.push({ ...questionItem });

                draft.push({ ...responseItem });
              }
            );
            handleUpdateChatList(newListWithAnswer);
          },
          onMessageReplace: (messageReplace) => {
            responseItem.content = messageReplace.answer;
          },
          onError() {
            handleResponding(false);
            const newChatList = produce(chatListRef.current, (draft) => {
              draft.splice(
                draft.findIndex((item) => item.id === placeholderAnswerId),
                1
              );
            });
            handleUpdateChatList(newChatList);
          },
        }
      );
      return true;
    },
    [updateCurrentQA, handleUpdateChatList, handleResponding, formatTime]
  );

  useEffect(() => {
    console.log(chatListRef.current, chatList, "item");
  }, [chatList, chatListRef]);

  // 监听 prevChatList 变化，并同步更新 chatList 和 chatListRef
  useEffect(() => {
    if (prevChatList) {
      setChatList(prevChatList); // 更新 chatList
      chatListRef.current = prevChatList; // 同步更新 chatListRef
    }
  }, [prevChatList]);

  return {
    chatList,
    setChatList,
    conversationId: connversationId.current,
    isResponding,
    setIsResponding,
    handleSend,
    handleRestart,
    handleStop,
    currentApp,
    setCurrentApp,
    appList,
    handleUpdateChatList,
    currentAppToken,
    lastMessage, 
  };
};
