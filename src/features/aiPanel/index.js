/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-09-14 10:46:18
 */
import React from "react";
import * as Popover from "@radix-ui/react-popover";
import Command from "./components/command";
import { stopChat as stopChatApi } from "@/services";
import { useChat } from "@/features/aiTools/hook";

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
}) => {
  return (
    <Popover.Root>
      {triggerType === "click" ? (
        <Popover.Trigger asChild>{children}</Popover.Trigger>
      ) : (
        <div className="editor-trigger">{children}</div>
      )}
      <Popover.Portal>
        <Popover.Content
          className="p-4 z-[12] relative"
          sideOffset={0}
          align={"start"}
        >
          <div className="flex flex-col items-start text-sm font-medium leading-none text-left min-w-[28rem] w-[30vw]">
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
            />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

const AiPanel = ({ children, triggerType }) => {
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
  } = useChat(null, stopChat);

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
      triggerType={triggerType}
    >
      {memoizedChildren}
    </CommandPopover>
  );
};

export default AiPanel;
