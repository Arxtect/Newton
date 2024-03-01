/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-01 17:07:27
 */
import React from "react";
import { Switch } from "@blueprintjs/core";
import { useGitRepo } from "store";
import GitEasy from "./gitEasy";
import GitViewer from "./gitViewer";

export const GitController = () => {
  const { easyMode, setConfigValue } = useGitRepo((state) => ({
    easyMode: state.easyMode,
    setConfigValue: state.setConfigValue,
  }));

  return (
    <div>
      <Switch
        label="Easy Mode"
        checked={easyMode}
        onChange={() => setConfigValue({ key: "easyMode", value: !easyMode })}
      />
      {easyMode ? <GitEasy /> : <GitViewer />}
    </div>
  );
};
