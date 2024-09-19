/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-09-14 10:46:18
 */
import React from "react";
import * as Popover from "@radix-ui/react-popover";
import Command from "./components/command";

const AiPanel = ({ children }) => {
  const memoizedChildren = React.useMemo(() => children, [children]);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>{memoizedChildren}</Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="p-4 z-[10] relative"
          sideOffset={0}
          align={"start"}
        >
          <div className="flex flex-col items-start text-sm font-medium leading-none text-left max-w-[300px]">
            <Command />
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default AiPanel;
