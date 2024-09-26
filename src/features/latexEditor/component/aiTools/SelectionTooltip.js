import React from "react";

const SelectionTooltip = ({ message, position }) => {
  return (
    <div
      className="absolute bg-gray-800 text-white py-1 px-2 rounded text-xs z-50 "
      style={{
        top: position.top,
        left: position.left,
        wordSpacing: "0.15rem",
        fontFamily: "serif",
      }}
    >
      {message}
    </div>
  );
};

export default SelectionTooltip;
