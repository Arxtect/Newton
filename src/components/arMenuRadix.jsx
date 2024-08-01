import React, {
  useState,
  useRef,
  useEffect,
  cloneElement,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

const ArMenuRadix = forwardRef(
  (
    {
      items,
      title,
      buttonClassName = "",
      isNeedIcon = true,
      align = "center",
      buttonCom = null,
      getButtonClass = null,
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

    const renderMenuItems = (items) => {
      return items.map((item, index) => (
        <React.Fragment key={index}>
          {!item.subMenu ? (
            <DropdownMenu.Item
              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer outline-none ${
                align === "center" ? "text-center" : "text-left"
              }`}
              onSelect={item.onSelect}
            >
              {item.label}
            </DropdownMenu.Item>
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
          {item.subMenu && renderMenuItems(item.subMenu)}
        </React.Fragment>
      ));
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
            align="end"
            sideOffset={5}
            style={{ minWidth: buttonWidth, width: "auto" }}
          >
            {renderMenuItems(items)}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </div>
    );
  }
);

export default ArMenuRadix;
