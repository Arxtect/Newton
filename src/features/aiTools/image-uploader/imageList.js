import React, { useState } from "react";
import { RiCloseLine, RiLoader2Line } from "@remixicon/react";
import RefreshCcw01 from "@/assets/chat/RefreshCcw01.svg";
import { TransferMethod } from "./types";
import ImagePreview from "./image-preview";

const ImageList = ({
  list,
  readonly,
  onRemove,
  onReUpload,
  onImageLinkLoadSuccess,
  onImageLinkLoadError,
}) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const handleImageLinkLoadSuccess = (item) => {
    if (
      item.type === TransferMethod.remote_url &&
      onImageLinkLoadSuccess &&
      item.progress !== -1
    )
      onImageLinkLoadSuccess(item._id);
  };

  const handleImageLinkLoadError = (item) => {
    if (item.type === TransferMethod.remote_url && onImageLinkLoadError)
      onImageLinkLoadError(item._id);
  };

  return (
    <div className="flex flex-wrap">
      {list.map((item) => (
        <div
          key={item._id}
          className="group relative mr-1 border-[0.5px] border-black/5 rounded-lg"
        >
          {item.type === TransferMethod.local_file && item.progress !== 100 && (
            <>
              <div
                className="absolute inset-0 flex items-center justify-center z-[1] bg-black/30"
                style={{ left: item.progress > -1 ? `${item.progress}%` : 0 }}
              >
                {item.progress === -1 && (
                  <img
                    src={RefreshCcw01}
                    alt="RefreshCcw01"
                    className="w-5 h-5 text-white"
                    onClick={() => onReUpload && onReUpload(item._id)}
                  />
                )}
              </div>
              {item.progress > -1 && (
                <span className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-sm text-white mix-blend-lighten z-[1]">
                  {item.progress}%
                </span>
              )}
            </>
          )}
          <img
            className="w-16 h-16 rounded-lg object-cover cursor-pointer border-[0.5px] border-black/5"
            alt={item.file?.name}
            onLoad={() => handleImageLinkLoadSuccess(item)}
            onError={() => handleImageLinkLoadError(item)}
            src={
              item.type === TransferMethod.remote_url
                ? item.url
                : item.base64Url
            }
            onClick={() =>
              item.progress === 100 &&
              setImagePreviewUrl(
                item.type === TransferMethod.remote_url
                  ? item.url
                  : item.base64Url
              )
            }
          />
          {!readonly && (
            <button
              type="button"
              className={`absolute z-10 -top-[9px] -right-[9px] items-center justify-center w-[18px] h-[18px]
                bg-white hover:bg-gray-50 border-[0.5px] border-black/2 rounded-2xl shadow-lg
                ${item.progress === -1 ? "flex" : "hidden group-hover:flex"}`}
              onClick={() => onRemove && onRemove(item._id)}
            >
              <RiCloseLine className="w-3 h-3 text-gray-500" />
            </button>
          )}
        </div>
      ))}
      {imagePreviewUrl && (
        <ImagePreview
          url={imagePreviewUrl}
          onCancel={() => setImagePreviewUrl("")}
        />
      )}
    </div>
  );
};

export default ImageList;
