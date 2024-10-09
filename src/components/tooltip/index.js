import React, { useRef, useState } from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { randomString } from "@/util";
import "react-tooltip/dist/react-tooltip.css";

const Tooltip = ({
  selector,
  content,
  disabled,
  position = "top",
  children,
  htmlContent,
  className,
  clickable = false,
  noArrow = false,
  isHasChildren = false,
}) => {
  // 如果没有提供 selector，则生成一个唯一 ID
  const uniqueId = useRef(`${content.slice(0, 10)}-tooltip-${randomString(4)}`);
  const tooltipId = selector || uniqueId.current;

  const [isOpen, setIsOpen] = useState(false);

  const handleMouseEnter = (event) => {
    if (disabled) return;
    if (isHasChildren && event.currentTarget !== event.target) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <>
      {React.cloneElement(children, {
        "data-tooltip-id": tooltipId,
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
      })}
      <ReactTooltip
        id={tooltipId}
        content={content}
        className={`!z-[999] !bg-white !text-xs !font-normal !text-gray-700 !shadow-lg !opacity-100 ${className}`}
        place={position}
        clickable={clickable}
        isOpen={!disabled && isOpen}
        noArrow={noArrow}
      >
        {htmlContent && htmlContent}
      </ReactTooltip>
    </>
  );
};

export default Tooltip;
