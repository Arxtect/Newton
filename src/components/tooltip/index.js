import React, { useRef } from "react";
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
}) => {
  // Generate a unique ID for the tooltip if selector is not provided
  const uniqueId = useRef(`${content}-tooltip-${randomString(4)}`);
  const tooltipId = selector || uniqueId.current;

  return (
    <>
      {React.cloneElement(children, {
        "data-tooltip-id": tooltipId,
      })}
      {/* <div data-tooltip-id={tooltipId}>{children}</div> */}
      <ReactTooltip
        id={tooltipId}
        content={content}
        className={`!z-[999] !bg-white !text-xs !font-normal !text-gray-700 !shadow-lg !opacity-100 ${className}`}
        place={position}
        clickable={clickable}
        isOpen={disabled ? false : undefined}
        noArrow={noArrow}
      >
        {htmlContent && htmlContent}
      </ReactTooltip>
    </>
  );
};

export default Tooltip;
