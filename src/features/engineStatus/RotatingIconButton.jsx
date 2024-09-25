/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-08-20 10:53:02
 */
import React, { useState } from "react";
import ArIcon from "@/components/arIcon";

const RotatingIcon = ({ isRotating = false }) => {
  return (
    <div className="flex h-full w-full hover:cursor-pointer text-arxTheme flex justify-center items-center">
      <button className="flex items-center text-white rounded">
        <ArIcon
          name={"Rotating"}
          alt="Rotating"
          className={`text-black h-4 w-4 ${
            isRotating ? "animate-spin-slow" : ""
          }`}
        />
      </button>
    </div>
  );
};

export default RotatingIcon;
