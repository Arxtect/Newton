import React, { useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const ArMenuRadix = ({ items, title, buttonClassName = "" }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <DropdownMenu.Root onOpenChange={(isOpen) => setOpen(isOpen)}>
        <DropdownMenu.Trigger asChild>
          <button
            className={`px-4 py-2 rounded-md focus:outline-none flex items-center justify-between w-full ${buttonClassName}`}
          >
            {title}
            <span className="ml-2">
              {open ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </span>
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content
          className="bg-white shadow-md rounded-md mt-2 py-2 z-50 right-0 w-auto"
          align="end"
          sideOffset={5}
        >
          {items.map((item, index) => (
            <React.Fragment key={index}>
              <DropdownMenu.Item
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onSelect={item.onSelect}
              >
                {item.label}
              </DropdownMenu.Item>
              {item.separator && (
                <DropdownMenu.Separator className="h-px bg-gray-200 my-2" />
              )}
            </React.Fragment>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </div>
  );
};

export default ArMenuRadix;
