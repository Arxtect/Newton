/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-03-08 10:15:06
 */
import React, { useState } from "react";
import { Tab, Tabs, Box, Card } from "@mui/material";

import GitController from "./gitController";
import FileHistory from "./fileHistory";
import Config from "./config";
import Help from "./help";

const GitTab = () => {
  const [activeTab, setActiveTab] = useState("git");

  const handleChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Card
      variant="outlined"
      className="overflow-hidden rounded-none"
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={activeTab}
          onChange={handleChange}
          aria-label="git tabs"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            overflow: "hidden",
            minHeight: "auto",
            ".MuiTab-root": {
              fontSize: "0.75rem", // 调整字体大小
              minHeight: "auto", // 调整Tab的最小高度
              padding: "10px 12px", // 调整内边距
              minHeight: "auto",
            },
            ".MuiTabs-indicator": {
              height: "2px", // 调整指示器高度
            },
          }}
        >
          <Tab label="Git" value="git" />
          <Tab label="History" value="history" />
          {/* <Tab label="Help" value="help" /> */}
          <Tab label="Config" value="config" />
        </Tabs>
      </Box>
      {/* 为内容区设置固定的高度并允许滚动 */}
      <Box sx={{ flexGrow: 1, overflowY: "auto", padding: "14px 20px" }}>
        {activeTab === "git" && <GitController />}
        {activeTab === "history" && <FileHistory />}
        {activeTab === "help" && <Help />}
        {activeTab === "config" && <Config />}
      </Box>
    </Card>
  );
};

export default GitTab;
