/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-10-08 12:50:58
 */
// src/components/ClickDropdownMenu.js
import React, { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import ArIcon from "@/components/arIcon";
const ClickDropdownMenu = ({ items, children, tip, ...res }) => {
  return (
    <DropdownMenu.Root {...res}>
      <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          sideOffset={5}
          style={{
            position: "absolute",
            backgroundColor: "white",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
            zIndex: 99999,
            minWidth: "150px",
            padding: "0.5rem",
          }}
        >
          {items.map((item, index) => (
            <DropdownMenu.Item
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                item.command(e);
              }}
              onSelect={(e) => {}}
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
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ClickDropdownMenu;
