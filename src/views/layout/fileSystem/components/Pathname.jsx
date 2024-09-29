/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-26 10:17:19
 */
import React from "react";

const Pathname = ({ ignoreGit, children }) => {
  const classNames = `font-normal text-base leading-6 tracking-wider ml-1 ${
    ignoreGit ? "text-gray-500" : "text-[var(--black)]"
  }`;

  const style = {
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  return (
    <span className={classNames} style={style} title={children}>
      {children}
    </span>
  );
};

export default Pathname;
