import React, {
  useState,
  useRef,
  useEffect,
  cloneElement,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  HamburgerMenuIcon,
  DotFilledIcon,
  CheckIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";

const ArMenuRadix = forwardRef(
  (
    {
      items,
      title,
      buttonClassName = "",
      isNeedIcon = true,
      align = "center",
      menuAlign = "end", // start, center, end
      buttonCom = null,
      getButtonClass = null,
      width,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);
    const [buttonWidth, setButtonWidth] = useState(null);
    const buttonRef = useRef(null);

    useEffect(() => {
      if (buttonRef.current) {
        setButtonWidth(buttonRef.current.offsetWidth);
      }
    }, []);

    const getItems = (item, parentItem = {}) => {
      let type = parentItem?.type || item.type;
      switch (type) {
        case "radio":
          return (
            <DropdownMenu.RadioGroup
              key={item.key || item.label}
              value={item.value}
              onValueChange={item.onSelect}
            >
              {item.subMenu.map((option, idx) => (
                <DropdownMenu.RadioItem
                  key={idx}
                  className={`flex items-center gap-6 px-6 py-1 hover:bg-gray-100 cursor-pointer outline-none ${
                    align === "center" ? "text-center" : "text-left"
                  }`}
                  value={option.value}
                >
                  <DropdownMenu.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
                    <CheckIcon />
                  </DropdownMenu.ItemIndicator>
                  {option.label}
                </DropdownMenu.RadioItem>
              ))}
            </DropdownMenu.RadioGroup>
          );
        case "checkbox":
          return (
            <DropdownMenu.CheckboxItem
              key={item.key || item.label}
              className={`flex items-center gap-4 px-4 py-2 hover:bg-gray-100 cursor-pointer outline-none ${
                align === "center" ? "text-center" : "text-left"
              }`}
              checked={item.checked}
              onCheckedChange={item.onCheckedChange}
            >
              <CheckIcon />
              {item.label}
            </DropdownMenu.CheckboxItem>
          );
        default:
          return (
            <DropdownMenu.Item
              key={item.key || item.label}
              className={`flex items-center gap-4 px-4 py-2 hover:bg-gray-100 cursor-pointer outline-none ${
                align === "center" ? "text-center" : "text-left"
              }`}
              onSelect={item.onSelect}
            >
              {item.icon && (
                <img
                  src={item.icon}
                  alt=""
                  className="w-5 h-5 cursor-pointer"
                />
              )}
              {item.label}
            </DropdownMenu.Item>
          );
      }
    };

    const renderMenuItems = (items, parentItem = {}) => {
      return items.map((item) => {
        return (
          <React.Fragment key={item.key || item.label}>
            {!item.subMenu ? (
              getItems(item, parentItem)
            ) : (
              <div
                className={`px-4 pt-2 text-gray-500 cursor-default flex justify-between items-center ${
                  align == "center" ? "text-center" : "text-left"
                }`}
              >
                {item.label}
              </div>
            )}
            {item.separator && (
              <DropdownMenu.Separator className="h-px bg-gray-200 my-2" />
            )}
            {item.subMenu &&
              item?.type != "radio" &&
              renderMenuItems(item.subMenu, item)}
            {item?.type == "radio" && getItems(item)}
          </React.Fragment>
        );
      });
    };

    useImperativeHandle(ref, () => ({
      open,
      setOpen,
    }));

    return (
      <div className="relative">
        <DropdownMenu.Root onOpenChange={(isOpen) => setOpen(isOpen)}>
          <DropdownMenu.Trigger asChild>
            {!buttonCom ? (
              <button
                ref={buttonRef}
                className={`flex items-center outline-none ${
                  isNeedIcon ? "justify-between" : "justify-center"
                } w-full ${buttonClassName}`}
              >
                {title}
                {isNeedIcon && (
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
                )}
              </button>
            ) : (
              cloneElement(buttonCom, {
                ref: buttonRef,
                className: `${buttonCom.props.className} ${
                  getButtonClass && getButtonClass(open)
                }`,
              })
            )}
          </DropdownMenu.Trigger>

          <DropdownMenu.Content
            className="bg-white shadow-md rounded-md  py-2 z-50 DropdownMenuContent"
            align={menuAlign || "end"}
            sideOffset={5}
            style={{ minWidth: buttonWidth, width: width || "auto" }}
          >
            {renderMenuItems(items)}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    );
  }
);

export default React.memo(ArMenuRadix);
