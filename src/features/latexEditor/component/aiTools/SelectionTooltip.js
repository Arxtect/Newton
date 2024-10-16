/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-10-12 15:54:48
 */
import React from "react";

const SelectionTooltip = ({ message, position }) => {
  return (
    <div
      className="absolute bg-gray-800 text-white py-1 px-2 rounded text-xs z-50 font-sans"
      style={{
        top: position.top,
        left: position.left,
        wordSpacing: "0.15rem",
      }}
    >
      {message}
    </div>
  );
};

export default SelectionTooltip;
