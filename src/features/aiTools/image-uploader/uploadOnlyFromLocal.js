import React, { useState } from "react";
import Uploader from "./uploader";
import ArIcon from "@/components/arIcon";

const UploadOnlyFromLocal = ({
  onUpload,
  disabled,
  limit,
  currentAppToken,
}) => {
  return (
    <Uploader
      onUpload={onUpload}
      disabled={disabled}
      limit={limit}
      currentAppToken={currentAppToken}
    >
      {(hovering) => (
        <div
          className={`
            relative flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer
            ${hovering && "bg-gray-100"}
          `}
        >
          <ArIcon name="ImagePlus" className="text-black w-4 h-4 "></ArIcon>
        </div>
      )}
    </Uploader>
  );
};

const ChatImageUploader = ({
  settings,
  onUpload,
  disabled,
  currentAppToken,
}) => {
  return (
    <UploadOnlyFromLocal
      onUpload={onUpload}
      disabled={disabled}
      currentAppToken={currentAppToken}
      // limit={+settings.image_file_size_limit}
    />
  );
};

export default ChatImageUploader;
