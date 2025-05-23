/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-08-27 15:21:14
 */
import { useRef, useState } from "react";
import copy from "copy-to-clipboard";
import Tooltip from "@/components/tooltip";
import { randomString } from "@/utils";
import "./index.css";

const CopyBtn = ({ value, className, isPlain, position }) => {
  const [isCopied, setIsCopied] = useState(false);
  const selector = useRef(`copy-tooltip-${randomString(4)}`);

  return (
    <div className={`${className}`}>
      <Tooltip
        selector={selector.current}
        content={isCopied ? "copied" : "copy"}
        className="z-10"
        position={position}
      >
        <div
          className={
            "box-border p-0.5 flex items-center justify-center rounded-md bg-white cursor-pointer"
          }
          style={
            !isPlain
              ? {
                  boxShadow:
                    "0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)",
                }
              : {}
          }
          onClick={() => {
            copy(value);
            setIsCopied(true);
          }}
        >
          <div
            className={`w-6 h-6 rounded-md hover:bg-gray-50  ${
              isCopied ? "copyIcon-copied" : "copyIcon"
            }`}
          ></div>
        </div>
      </Tooltip>
    </div>
  );
};

export default CopyBtn;
