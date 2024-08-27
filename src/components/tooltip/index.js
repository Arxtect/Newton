import React from "react";
import { Tooltip as ReactTooltip } from "react-tooltip";

import "react-tooltip/dist/react-tooltip.css";

const Tooltip = ({
  selector,
  content,
  disabled,
  position = "top",
  children,
  htmlContent,
  className,
  clickable,
  noArrow,
}) => {
  return (
    <div className="tooltip-container">
      {React.cloneElement(children, {
        "data-tooltip-id": selector,
      })}
      <ReactTooltip
        id={selector}
        content={content}
        className={
          `!z-[999] !bg-white !text-xs !font-normal !text-gray-700 !shadow-lg !opacity-100 ${className}`}
        place={position}
        clickable={clickable}
        isOpen={disabled ? false : undefined}
        noArrow={noArrow}
      >
        {htmlContent && htmlContent}
      </ReactTooltip>
    </div>
  );
};

export default Tooltip;
