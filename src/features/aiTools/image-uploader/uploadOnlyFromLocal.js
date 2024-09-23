import React, { useState } from "react";
import Uploader from "./uploader";
import ImagePlus from "@/assets/chat/ImagePlus.svg";

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
          <img src={ImagePlus} alt="Upload" className="w-4 h-4 text-gray-500" />
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
