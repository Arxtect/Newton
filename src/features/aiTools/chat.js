import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
// import { debounce } from 'lodash-es';
import Question from './question';
import Answer from './answer';
import ChatInput from './chat-input';
import Button from './button';
// import { StopCircle } from '@/app/components/base/icons/src/vender/solid/mediaAndDevices';
import chatListDemo from './chatListdemo'
// import "./markdown.scss"

const Chat = ({
  isResponding,
  noStopResponding,
  onStopResponding,
  chatContainerInnerClassName,
  chatFooterClassName,
  chatFooterInnerClassName,
  // showPromptLog,
  // questionIcon,
  // answerIcon,
  // allToolIcons,
  chatNode,
  // chatAnswerContainerInner,
  // hideProcessDetail,
  themeBuilder,
  inputsForms,
  newConversationInputs,
  handleSend
}) => {
  const chatList = chatListDemo
  const [width, setWidth] = useState(0);
  const chatContainerRef = useRef(null);
  const chatContainerInnerRef = useRef(null);
  const chatFooterRef = useRef(null);
  const chatFooterInnerRef = useRef(null);
  const userScrolledRef = useRef(false);
  const [newConversationId, setNewConversationId] = useState('')

  const handleNewConversationCompleted = useCallback((newConversationId) => {
    setNewConversationId(newConversationId)
  }, [])

  const handleScrolltoBottom = useCallback(() => {
    if (chatContainerRef.current && !userScrolledRef.current)
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  }, []);

  const handleWindowResize = useCallback(() => {
    if (chatContainerRef.current)
      setWidth(document.body.clientWidth - (chatContainerRef.current.clientWidth + 16) - 8);

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

  // useEffect(() => {
  //   window.addEventListener('resize', debounce(handleWindowResize));
  //   return () => window.removeEventListener('resize', handleWindowResize);
  // }, [handleWindowResize]);

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
          userScrolledRef.current = chatContainer.scrollHeight - chatContainer.scrollTop >= chatContainer.clientHeight + 300;
      };
      chatContainer.addEventListener('scroll', setUserScrolled);
      return () => chatContainer.removeEventListener('scroll', setUserScrolled);
    }
  }, []);

  const onSend = useCallback((message, files) => {
    const data = {
      query: message,
      inputs:  newConversationInputs,
      conversation_id: newConversationId,
      response_mode: "streaming"
    };

    if (files?.length)
      data.files = files;

    handleSend(
      data,
      {
        onConversationComplete: newConversationId ? undefined : handleNewConversationCompleted,
      }
    );
  }, [
    newConversationId,
    newConversationInputs,
    handleNewConversationCompleted,
  ]);







  return (
      <div className='relative h-full w-full'>
        <div
          ref={chatContainerRef}
          className={'relative h-full overflow-y-auto'}
        >
          {chatNode}
          <div
            ref={chatContainerInnerRef}
            className={`${chatContainerInnerClassName}`}
          >
            {
              chatList.map((item, index) => {
                if (item.answer) {
                  const isLast = item.id === chatList[chatList.length - 1]?.id;
                  return (
                    <Answer
                      key={item.id}
                      item={item}
                      question={chatList[index - 1]?.content}
                      index={index}
                      // answerIcon={answerIcon}
                      // responding={isLast && isResponding}
                      // allToolIcons={allToolIcons}
                      // showPromptLog={showPromptLog}
                      // chatAnswerContainerInner={chatAnswerContainerInner}
                      // hideProcessDetail={hideProcessDetail}
                    />
                  );
                }
                return (
                  <Question
                    key={item.id}
                    item={item}
                  />
                );
              })
            }
          </div>
        </div>
        <div
          className={`absolute bottom-0 ${(!noStopResponding) && chatFooterClassName}`}
          ref={chatFooterRef}
          style={{
            background: 'linear-gradient(0deg, #F9FAFB 40%, rgba(255, 255, 255, 0.00) 100%)',
          }}
        >
          <div
            ref={chatFooterInnerRef}
            className={`${chatFooterInnerClassName}`}
          >
            {
              !noStopResponding && isResponding && (
                <div className='flex justify-center mb-2'>
                  <Button onClick={onStopResponding}>
                    {/* <StopCircle className='mr-[5px] w-3.5 h-3.5 text-gray-500' /> */}
                    <span className='text-xs text-gray-500 font-normal'>{'appDebug.operation.stopResponding'}</span>
                  </Button>
                </div>
              )
            }
           
           <ChatInput
                  // visionConfig={config?.file_upload?.image}
                  // speechToTextConfig={config?.speech_to_text}
                  onSend={onSend}
                  // theme={themeBuilder?.theme}
                />
          </div>
        </div>
       
      </div>
  );
};

export default memo(Chat);
