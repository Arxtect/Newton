import React from "react";
import ArIcon from "@/components/arIcon";
import path from "path";

const FileViewHeader = ({ filename, url }) => {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      <a
        href={url}
        download={path.basename(filename)}
        className="flex items-center bg-white border border-gray-600 text-gray-800 rounded-full cursor-pointer text-base font-bold leading-relaxed px-4 py-1 text-center select-none align-middle whitespace-nowrap gap-2"
      >
        <ArIcon name="Download" className="w-4 h-4"></ArIcon>
        <span>Download</span>
      </a>
    </div>
  );
};

export default FileViewHeader;
