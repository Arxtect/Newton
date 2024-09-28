// src/components/ContextMenuWrapper.js
import React, { useRef, useEffect, useState } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import ArIcon from "@/components/arIcon";

const ContextMenuWrapper = ({ items, children }) => {
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({
    x: 0,
    y: 0,
  });

  const handleContextMenu = (event) => {
    event.preventDefault();
    setContextMenuPosition({ x: event.clientX, y: event.clientY });
    setContextMenuVisible(true);
  };

  useEffect(() => {
    const handleClick = () => setContextMenuVisible(false);
    if (contextMenuVisible) {
      document.addEventListener("click", handleClick);
    } else {
      document.removeEventListener("click", handleClick);
    }
    return () => document.removeEventListener("click", handleClick);
  }, [contextMenuVisible]);

  return (
    <div
      onContextMenu={handleContextMenu}
      className="relative w-full"
    >
      <ContextMenu.Root
        open={contextMenuVisible}
        onOpenChange={setContextMenuVisible}
      >
        <ContextMenu.Trigger asChild>
          <div>{children}</div>
        </ContextMenu.Trigger>
        <ContextMenu.Content
          style={{ top: contextMenuPosition.y, left: contextMenuPosition.x }}
          className="bg-white shadow-lg rounded-md z-[99999] min-w-[150px]  py-1"
        >
          {items.map((item, index) => (
            <ContextMenu.Item
              key={index}
              onSelect={item.command}
              className="flex items-center p-[0.35rem] hover:bg-gray-200 cursor-pointer text-[13px]"
            >
              {item.icon && (
                <span className="mx-2">
                  <ArIcon
                    name={item.icon}
                    alt={item.icon}
                    className={"inline-block w-[20px] h-[20px]"}
                  />
                </span>
              )}
                  <span className="font-[sans-serif]">{item.label}</span>
            </ContextMenu.Item>
          ))}
        </ContextMenu.Content>
      </ContextMenu.Root>
    </div>
  );
};

export default ContextMenuWrapper;
