import React, { useState } from "react";
import ImagePreview from "./image-preview";

const getWidthStyle = (imgNum) => {
  if (imgNum === 1) {
    return "max-w-full";
  }

  if (imgNum === 2 || imgNum === 4) {
    return "w-[calc(50%-4px)]";
  }

  return "w-[calc(33.3333%-5.3333px)]";
};

const ImageGallery = ({ srcs }) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const imgNum = srcs.length;
  const imgStyle = getWidthStyle(imgNum);
  return (
    <div className={`img-${imgNum} flex flex-wrap`}>
      {srcs.map((src, index) => (
        <img
          key={index}
          className={`h-52 mr-2 mb-2 object-cover object-center rounded cursor-pointer ${imgStyle} ${
            imgNum === 2 || imgNum === 4 ? "nth-child-2n:mr-0" : ""
          } ${imgNum === 4 ? "nth-child-3n:mr-2" : ""}`}
          src={src}
          alt=""
          onClick={() => setImagePreviewUrl(src)}
          onError={(e) => e.currentTarget.remove()}
        />
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

export default React.memo(ImageGallery);
