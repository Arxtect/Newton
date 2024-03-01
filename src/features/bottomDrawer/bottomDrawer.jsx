import React from "react";
import { Drawer, Position, Button } from "@blueprintjs/core";
import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";

// 假设外部控制的isOpen状态和toggleDrawer函数已经传入
const BottomDrawer = ({ isOpen, toggleDrawer }) => {
  return (
    <Drawer
      isOpen={isOpen}
      position={Position.BOTTOM}
      onClose={() => toggleDrawer(false)}
      title="Git Terminal"
      icon={<Icon icon={IconNames.GIT_REPO} />}
      size={Drawer.SIZE_SMALL}
      className="max-h-[40vh]"
    >
      <div className="max-h-[40vh] overflow-y-auto p-4 mb-4 pb-0">
        <p>这里是Git Terminal的内容...</p>
        {/* 示例内容，确保内容足够多以超过30vh */}
        {Array.from({ length: 20 }).map((_, index) => (
          <p key={index}>更多内容 {index + 1}</p>
        ))}
      </div>
    </Drawer>
  );
};

export default BottomDrawer;
