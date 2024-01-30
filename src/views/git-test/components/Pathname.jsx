import React from "react";

const Pathname = ({ ignoreGit, children }) => {
  const classNames = `font-normal text-base leading-6 tracking-wider ml-1 ${
    ignoreGit ? "text-gray-500" : "text-[var(--black)]"
  }`;

  return <span className={classNames}>{children}</span>;
};

export default Pathname;
