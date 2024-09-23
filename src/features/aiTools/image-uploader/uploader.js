/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-09-18 14:26:22
 */
import { useState } from "react";
import { useLocalFileUploader } from "./hooks";
import { ALLOW_FILE_EXTENSIONS } from "./types";

const Uploader = ({
  children,
  onUpload,
  closePopover,
  limit,
  disabled,
  currentAppToken,
}) => {
  const [hovering, setHovering] = useState(false);
  const { handleLocalFileUpload } = useLocalFileUploader({
    limit,
    onUpload,
    disabled,
    currentAppToken,
  });

  const handleChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    handleLocalFileUpload(file);
    closePopover?.();
  };

  return (
    <div
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {children(hovering)}
      <input
        className="absolute block inset-0 opacity-0 text-[0] w-full disabled:cursor-not-allowed cursor-pointer"
        onClick={(e) => (e.target.value = "")}
        type="file"
        accept={ALLOW_FILE_EXTENSIONS.map((ext) => `.${ext}`).join(",")}
        onChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
};

export default Uploader;
