import React from "react";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import { useGitRepo } from "store";
import GitEasy from "./gitEasy";
import GitViewer from "./gitViewer";

const GitController = () => {
  const { easyMode, changeConfig } = useGitRepo((state) => ({
    easyMode: state.gitEasyMode,
    changeConfig: state.changeConfig,
  }));

  // 处理开关变化
  const handleToggle = (event) => {
    changeConfig({ gitEasyMode: event.target.checked });
  };

  return (
    <div>
      <FormControlLabel
        control={
          <Switch checked={easyMode} onChange={handleToggle} size="small" />
        }
        label="Easy Mode"
        sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.875rem" } }} // 调整标签字体大小
      />
      {easyMode ? <GitEasy /> : <GitViewer />}
    </div>
  );
};

export default GitController;
