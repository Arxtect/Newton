/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-08-07 10:13:45
 */
import React from "react";
import vectorSvg from "@/assets/vector.svg";

function DropZone({ type }) {
  return (
    <div className="flex flex-col justify-center items-center px-20 py-24 bg-green-100 max-md:px-5 max-md:pb-24 max-md:max-w-full">
      <div className="flex flex-col mb-0 max-w-full w-[336px] max-md:mb-2.5">
        <img
          loading="lazy"
          src={vectorSvg}
          className="object-contain self-center w-10 aspect-square"
          alt=""
        />
        <p className="mt-2.5">
          {type == "zip"
            ? "Drag or select zip file from your computer"
            : "Drag or select files or a folder from your computer"}
        </p>
      </div>
    </div>
  );
}

export default DropZone;
