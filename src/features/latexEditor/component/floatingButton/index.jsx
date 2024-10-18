/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-10-18 15:40:34
 */
import React, { useEffect } from "react";
import ArIcon from "@/components/arIcon";

const FloatingButton = ({
  showAiTools,
  setShowAiTools,
  isSelection,
  floatingPosition,
  selectHandler,
}) => {
  const handleButtonClick = () => {
    setShowAiTools(true);
    selectHandler();
  };

  return (
    <div>
      {isSelection && !showAiTools && (
        <button
          className="absolute z-10 rounded-full w-8 h-8 flex items-center justify-center bg-white"
          style={{
            top: floatingPosition.top,
            left: floatingPosition.left,
            transform: "translateX(-150%)",
            boxShadow:
              "rgba(15, 15, 15, 0.1) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 2px 4px",
          }}
          onClick={handleButtonClick}
        >
          <ArIcon
            name={"Magic"}
            className="text-black w-5 h-5 cursor-pointer hover:opacity-75"
          />
        </button>
      )}
    </div>
  );
};

export default FloatingButton;
