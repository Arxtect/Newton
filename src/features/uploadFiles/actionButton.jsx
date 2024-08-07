import React, { useRef } from "react";

function ActionButtons({ handleUpload, type }) {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFolderButtonClick = () => {
    folderInputRef.current.click();
  };

  return (
    <div className="flex gap-9 self-end mt-6 max-md:mr-1">
      {type === "zip" ? (
        <>
          <button className="px-3 py-1.5 bg-gray-200 rounded-lg" onClick={handleFileButtonClick}>
            Pick a zip file
          </button>
          <input
            type="file"
            className="hidden"
            accept=".zip"
            ref={fileInputRef}
            onChange={(e) => handleUpload(e.target.files[0])}
          />
        </>
      ) : (
        <>
          <button className="px-3 py-1.5 bg-gray-200 rounded-lg" onClick={handleFileButtonClick}>
            Pick a file
          </button>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) => handleUpload(e.target.files)}
          />
          <button className="px-3 py-1.5 bg-green-300 rounded-lg" onClick={handleFolderButtonClick}>
            Pick a folder
          </button>
          <input
            type="file"
            className="hidden"
            webkitdirectory=""
            ref={folderInputRef}
            onChange={(e) => handleUpload(e.target.files)}
          />
        </>
      )}
    </div>
  );
}

export default ActionButtons;