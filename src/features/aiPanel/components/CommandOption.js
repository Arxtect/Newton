/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-09-14 10:51:27
 */
import React from "react";

const CommandOption = ({ icon, text }) => {
  return (
    <div className="flex gap-3.5">
      <img
        loading="lazy"
        src={icon}
        className="object-contain shrink-0 w-6 aspect-square"
        alt=""
      />
      <div className="my-auto">{text}</div>
    </div>
  );
};

export default CommandOption;
