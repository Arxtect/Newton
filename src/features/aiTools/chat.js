import React, { memo, useCallback, useEffect, useRef, useState } from "react";
// import { debounce } from 'lodash-es';
import Question from "./question";
import Answer from "./answer";
import ChatInput from "./chat-input";
import Button from "./button";
import { getChatApiUrl } from "./ssePost";
import ArIcon from "@/components/arIcon";

const Chat = ({
  chatList,
  isResponding,
  noStopResponding,
  handleStop,
  chatContainerInnerClassName,
  chatFooterClassName,
  chatFooterInnerClassName,
  currentAppToken,
  chatNode,
  inputsForms,
  newConversationInputs,
  handleSend,
  currentApp,
  user,
}) => {
  const [width, setWidth] = useState(0);
  const chatContainerRef = useRef(null);
  const chatContainerInnerRef = useRef(null);
  const chatFooterRef = useRef(null);
  const chatFooterInnerRef = useRef(null);
  const userScrolledRef = useRef(false);
  const [newConversationId, setNewConversationId] = useState("");

  const handleNewConversationCompleted = useCallback((newConversationId) => {
    setNewConversationId(newConversationId);
  }, []);

  const handleScrolltoBottom = useCallback(() => {
    if (chatContainerRef.current && !userScrolledRef.current)
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
  }, []);

  const handleWindowResize = useCallback(() => {
    if (chatContainerRef.current)
      setWidth(
        document.body.clientWidth -
          (chatContainerRef.current.clientWidth + 16) -
          8
      );

    if (chatContainerRef.current && chatFooterRef.current)
      chatFooterRef.current.style.width = `${chatContainerRef.current.clientWidth}px`;

    if (chatContainerInnerRef.current && chatFooterInnerRef.current)
      chatFooterInnerRef.current.style.width = `${chatContainerInnerRef.current.clientWidth}px`;
  }, []);

  useEffect(() => {
    handleScrolltoBottom();
    handleWindowResize();
  }, [handleScrolltoBottom, handleWindowResize]);

  useEffect(() => {
    if (chatContainerRef.current) {
      requestAnimationFrame(() => {
        handleScrolltoBottom();
        handleWindowResize();
      });
    }
  });

  useEffect(() => {
    if (chatFooterRef.current && chatContainerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { blockSize } = entry.borderBoxSize[0];

          chatContainerRef.current.style.paddingBottom = `${blockSize}px`;
          handleScrolltoBottom();
        }
      });

      resizeObserver.observe(chatFooterRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [handleScrolltoBottom]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (chatContainer) {
      const setUserScrolled = () => {
        if (chatContainer)
          userScrolledRef.current =
            chatContainer.scrollHeight - chatContainer.scrollTop >=
            chatContainer.clientHeight + 300;
      };
      chatContainer.addEventListener("scroll", setUserScrolled);
      return () => chatContainer.removeEventListener("scroll", setUserScrolled);
    }
  }, []);

  const onSend = useCallback(
    (message, files) => {
      const data = {
        query: message,
        inputs: newConversationInputs || {},
        conversation_id: newConversationId,
        response_mode: "streaming",
      };

      if (files?.length) data.files = files;

      handleSend(getChatApiUrl(), data, {
        onConversationComplete: newConversationId
          ? undefined
          : handleNewConversationCompleted,
        currentAppToken,
      });
    },
    [
      currentAppToken,
      newConversationId,
      newConversationInputs,
      handleNewConversationCompleted,
    ]
  );

  return (
    <div className="relative h-full w-full">
      <div
        ref={chatContainerRef}
        className={"relative h-full overflow-y-auto px-4 pt-4"}
      >
        {chatNode}
        <div
          ref={chatContainerInnerRef}
          className={`${chatContainerInnerClassName}`}
        >
          {chatList.map((item, index) => {
            if (item.isAnswer) {
              const isLast = item.id === chatList[chatList.length - 1]?.id;
              return (
                <Answer
                  key={item.id}
                  item={item}
                  question={chatList[index - 1]?.content}
                  index={index}
                  responding={isLast && isResponding}
                  // answerIcon={answerIcon}
                  // allToolIcons={allToolIcons}
                  // showPromptLog={showPromptLog}
                  // chatAnswerContainerInner={chatAnswerContainerInner}
                  // hideProcessDetail={hideProcessDetail}
                />
              );
            }
            return <Question key={item.id} item={item} user={user} />;
          })}
        </div>
      </div>
      <div
        className={`absolute bottom-0 flex justify-center ${
          !noStopResponding && chatFooterClassName
        }`}
        ref={chatFooterRef}
        style={{
          background:
            "linear-gradient(0deg, #F9FAFB 40%, rgba(255, 255, 255, 0.00) 100%)",
        }}
      >
        <div
          ref={chatFooterInnerRef}
          className={`${chatFooterInnerClassName} mb-2`}
        >
          {!noStopResponding && isResponding && (
            <div className="flex justify-center mb-2">
              <Button onClick={handleStop}>
                <ArIcon
                  name="Stop"
                  className="mr-[5px] w-3.5 h-3.5 text-gray-500"
                />
                <span className="text-xs text-gray-500 font-normal">
                  {"Stop responding" || "appDebug.operation.stopResponding"}
                </span>
              </Button>
            </div>
          )}

          <ChatInput
            visionConfig={currentApp?.file_upload?.image}
            // speechToTextConfig={config?.speech_to_text}
            onSend={onSend}
            currentAppToken={currentAppToken}
            currentApp={currentApp}
          />
        </div>
      </div>
    </div>
  );
};

export default memo(Chat);
