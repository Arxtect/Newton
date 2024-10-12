/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-08-27 15:21:14
 */
import { useRef, useState } from "react";
import Tooltip from "@/components/tooltip";
import { randomString } from "@/util";
import ArIcon from "@/components/arIcon";

const InsertBtn = ({ value, className, isPlain, position, insert }) => {
  const selector = useRef(`insert-tooltip-${randomString(4)}`);

  return (
    <div className={`${className}`}>
      <Tooltip
        selector={selector.current}
        content={"insert"}
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
            insert && insert(value);
          }}
        >
          <div
            className={`flex justify-center items-center w-6 h-6 rounded-md `}
          >
            <ArIcon
              name={"Insert"}
              alt={"Insert"}
              className={"text-gray-600 w-4 h-4 hover:text-black"}
            />
          </div>
        </div>
      </Tooltip>
    </div>
  );
};

export default InsertBtn;
