
import React, { useState } from "react";
import rotatingSvg from "@/assets/rotating.svg";
const RotatingIcon = ({ isRotating=false }) => {

  return (
    <div className="flex h-full w-full hover:cursor-pointer text-arxTheme flex justify-center items-center">
      <button className="flex items-center text-white rounded">
        <img
          src={rotatingSvg}
          alt="Rotating Icon"
          className={`h-4 w-4 ${isRotating ? "animate-spin-slow" : ""}`}
        />
      </button>
    </div>
  );
};

export default RotatingIcon;
