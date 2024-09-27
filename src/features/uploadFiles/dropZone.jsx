/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-08-07 10:13:45
 */
import React, { useRef } from "react";
import vectorSvg from "@/assets/vector.svg";

function DropZone({ type, handleUpload }) {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFolderButtonClick = () => {
    folderInputRef.current.click();
  };

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
          {type == "zip" ? (
            <div>
              Drag or{" "}
              {
                <span
                  className="text-arxTheme cursor-pointer"
                  onClick={handleFileButtonClick}
                >
                  select
                  <input
                    type="file"
                    className="hidden"
                    accept=".zip"
                    ref={fileInputRef}
                    onChange={(e) => handleUpload(e.target.files[0])}
                  />
                </span>
              }{" "}
              zip file from your computer
            </div>
          ) : (
            <div>
              Drag or{" "}
              <span
                className="text-arxTheme cursor-pointer"
                onClick={handleFileButtonClick}
              >
                select files
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </span>{" "}
              or{" "}
              <span
                className="text-arxTheme cursor-pointer"
                onClick={handleFolderButtonClick}
              >
                select a folder
                <input
                  type="file"
                  className="hidden"
                  webkitdirectory=""
                  ref={folderInputRef}
                  onChange={(e) => handleUpload(e.target.files)}
                />
              </span>{" "}
              from your computer
            </div>
          )}
        </p>
      </div>
    </div>
  );
}

export default DropZone;
