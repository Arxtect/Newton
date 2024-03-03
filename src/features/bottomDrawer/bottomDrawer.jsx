import React from "react";
import { Drawer, Position, Button } from "@blueprintjs/core";
import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import GitTab from "./gitTab";

// 假设外部控制的isOpen状态和toggleDrawer函数已经传入
const BottomDrawer = ({ isOpen, toggleDrawer }) => {
  return (
    <Drawer
      isOpen={isOpen}
      position={Position.BOTTOM}
      onClose={() => toggleDrawer(false)}
      // title="Git Terminal"
      // icon={<Icon icon={IconNames.GIT_REPO} />}
      size={Drawer.SIZE_SMALL}
      className="max-h-[40vh]"
    >
      <div className="max-h-[40vh] overflow-y-auto">
        <GitTab />
      </div>
    </Drawer>
  );
};

export default BottomDrawer;
