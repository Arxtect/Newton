/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-01 18:07:44
 */
import React from "react";
import { Card, Tab, Tabs } from "@blueprintjs/core";
import { useGitRepo } from "store"; // Update with the correct path
import GitController from "./gitController";
import FileHistory from "./fileHistory";
import Help from "/help";

const GitTab = () => {
  const { filetype, value, filepath, activeSupport, setActiveSupport } =
    useGitRepo();

  return (
    <Card
      style={{
        borderRadius: 0,
        height: "calc(100vh - 32px)",
        overflow: "auto",
      }}
    >
      <Tabs
        id="TabsExample"
        onChange={(newTabId) => setActiveSupport(newTabId)}
        selectedTabId={activeSupport}
        renderActiveTabPanelOnly
        animate={false}
      >
        <Tab id="git" title="Git" panel={<GitController />} />
        <Tab
          id="history"
          title="History"
          panel={<FileHistory filepath={filepath} />}
        />
        <Tab id="help" title="Help" panel={<Help />} />
      </Tabs>
    </Card>
  );
};

export default GitTab;
