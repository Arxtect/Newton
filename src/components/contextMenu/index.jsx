// src/components/ContextMenuWrapper.js
import React, { useRef, useEffect, useState } from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import ArIcon from "@/components/arIcon";

const ContextMenuWrapper = ({ items, children, hovered = false }) => {
  return (
    <div className="relative w-full">
      <ContextMenu.Root>
        <ContextMenu.Trigger asChild>
          <div>{children}</div>
        </ContextMenu.Trigger>
        <ContextMenu.Content className="bg-white shadow-lg rounded-md z-[99999] min-w-[150px]  py-1">
          {items.map((item, index) => (
            <ContextMenu.Item
              key={index}
              onSelect={(e) => {
                item.command(e);
              }}
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
