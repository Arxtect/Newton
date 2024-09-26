/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-09-23 15:08:59
 */
import React from "react";
import CommandInput from "./CommandInput";

const Command = ({
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
  incomeCommandOptions,
  triggerType,
  commandInputRef,
  ...res
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="w-full">
        <div className="w-full">
          <CommandInput
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
            ref={commandInputRef}
            {...res}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(Command);
