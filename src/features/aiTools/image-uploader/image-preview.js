import { createPortal } from "react-dom";
import { RiCloseLine } from "@remixicon/react";

const ImagePreview = ({ url, onCancel }) => {
  return createPortal(
    <div
      className="fixed inset-0 p-8 flex items-center justify-center bg-black/80 z-[1000]"
      onClick={(e) => e.stopPropagation()}
    >
      <img alt="preview image" src={url} className="max-w-full max-h-full" />
      <div
        className="absolute top-6 right-6 flex items-center justify-center w-8 h-8 bg-white/8 rounded-lg backdrop-blur-[2px] cursor-pointer"
        onClick={onCancel}
      >
        <RiCloseLine className="w-4 h-4 text-white" />
      </div>
    </div>,
    document.body
  );
};

export default ImagePreview;
