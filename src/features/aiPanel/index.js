/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-09-14 10:46:18
 */
import React, { useEffect, useCallback } from "react";
import * as Popover from "@radix-ui/react-popover";
import Command from "./components/command";
import { stopChat as stopChatApi } from "@/services";
import { useChat } from "@/features/aiTools/hook";
import { useFileStore, useEditor } from "@/store";

const CommandPopover = ({
  children,
  chatList,
  isResponding,
  setIsResponding,
  handleSend,
  handleRestart,
  handleStop,
  currentAppToken,
  currentApp,
  appList,
  setCurrentApp,
  triggerType = "click",
  incomeCommandOptions,
  ...res
}) => {
  let cssCommand =
    "flex flex-col items-start text-sm font-medium leading-none text-left min-w-[28rem] w-[30vw]";
  return (
    <Popover.Root>
      {triggerType === "click" ? (
        <Popover.Trigger asChild>{children}</Popover.Trigger>
      ) : (
        <div className={cssCommand}>
          <Command
            chatList={chatList}
            isResponding={isResponding}
            setIsResponding={setIsResponding}
            handleSend={handleSend}
            handleRestart={handleRestart}
            handleStop={handleStop}
            currentAppToken={currentAppToken}
            currentApp={currentApp}
            appList={appList}
            setCurrentApp={setCurrentApp}
            incomeCommandOptions={incomeCommandOptions}
            triggerType={triggerType}
            {...res}
          />
        </div>
      )}
      <Popover.Portal>
        <Popover.Content
          className="p-4 z-[12] relative"
          sideOffset={0}
          align={"start"}
        >
          <div className={cssCommand}>
            <Command
              chatList={chatList}
              isResponding={isResponding}
              setIsResponding={setIsResponding}
              handleSend={handleSend}
              handleRestart={handleRestart}
              handleStop={handleStop}
              currentAppToken={currentAppToken}
              currentApp={currentApp}
              appList={appList}
              setCurrentApp={setCurrentApp}
              incomeCommandOptions={incomeCommandOptions}
              triggerType={triggerType}
              {...res}
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const AiPanel = ({
  children,
  triggerType,
  setAnswerContent,
  setIsResponding: handleSetIsResponding,
  incomeCommandOptions,
  ...res
}) => {
  const memoizedChildren = React.useMemo(() => children, [children]);

  const stopChat = async (taskId, currentAppToken) => {
    console.log(`Stop chat with taskId: ${taskId}`);
    await stopChatApi(taskId, currentAppToken);
  };

  const {
    chatList,
    isResponding,
    setIsResponding,
    handleSend,
    handleRestart,
    handleStop,
    currentAppToken,
    currentApp,
    appList,
    setCurrentApp,
    setDefaultApp,
    lastMessage,
  } = useChat(null, stopChat);

  const { filepath } = useFileStore((state) => ({
    filepath: state.filepath,
  }));

  const { editor } = useEditor((state) => ({
    editor: state.editor,
  }));

  useEffect(() => {
    setAnswerContent && setAnswerContent(lastMessage);
  }, [chatList]);

  useEffect(() => {
    console.log(isResponding, "isResponding2");
    handleSetIsResponding && handleSetIsResponding(isResponding);
  }, [isResponding]);

  const insertToEditor = useCallback(
    (text) => {
      console.log(text, filepath, "text");

      if (!filepath || !text || !editor) return;

      const cursorPositionData = JSON.parse(
        sessionStorage.getItem("cursorPosition")
      );
      const cursorPosition = cursorPositionData[filepath];

      if (!cursorPosition) return;

      // 设置光标位置
      editor.gotoLine(cursorPosition.row + 1, cursorPosition.column);

      // 插入文本
      editor.insert(text);
    },
    [editor, filepath]
  );

  return (
    <CommandPopover
      chatList={chatList}
      isResponding={isResponding}
      setIsResponding={setIsResponding}
      handleSend={handleSend}
      handleRestart={handleRestart}
      handleStop={handleStop}
      currentAppToken={currentAppToken}
      currentApp={currentApp}
      appList={appList}
      setCurrentApp={setCurrentApp}
      setDefaultApp={setDefaultApp}
      triggerType={triggerType}
      incomeCommandOptions={incomeCommandOptions}
      insertToEditor={insertToEditor}
      {...res}
    >
      {memoizedChildren}
    </CommandPopover>
  );
};

export default AiPanel;
