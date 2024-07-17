import React from "react";
import path from "path";
import Viewer from "../pdfPreview/viewer";

const AssetPreview = React.memo(({ filename, content }) => {
  const fileExtension = path.extname(filename).slice(1).toLowerCase();

  if (!filename || (!content && !content.data)) {
    return;
  }

  let formattedContent = Uint8Array.from(content.data ?? content);

  if (
    fileExtension === "jpg" ||
    fileExtension === "jpeg" ||
    fileExtension === "png" ||
    fileExtension === "gif" ||
    fileExtension === "bmp" ||
    fileExtension === "svg"
  ) {
    // 图片文件预览
    const imageURL = URL.createObjectURL(
      new Blob([formattedContent], { type: `image/${fileExtension}` })
    );
    return <img src={imageURL} alt="image" />;
  } else if (fileExtension === "pdf") {
    // PDF文件预览
    const pdfURL = URL.createObjectURL(
      new Blob([formattedContent], { type: "application/pdf" })
    );
    return (
      <embed
        src={pdfURL}
        type="application/pdf"
        width="100%"
        className="h-full"
      />
    );
    //  return <Viewer url={pdfURL}></Viewer>;
  } else if (fileExtension === "mp4") {
    // 视频文件预览
    const videoURL = URL.createObjectURL(
      new Blob([formattedContent], { type: "video/mp4" })
    );
    return (
      <video controls width="100%" height="auto">
        <source src={videoURL} type="video/mp4" />
      </video>
    );
  } else if (fileExtension === "mp3" || fileExtension === "wav") {
    // 音频文件预览
    const audioURL = URL.createObjectURL(
      new Blob([formattedContent], { type: `audio/${fileExtension}` })
    );
    return (
      <audio controls>
        <source src={audioURL} type={`audio/${fileExtension}`} />
      </audio>
    );
  } else {
    // 其他文件类型暂不支持预览
    return <div>不支持预览该文件类型</div>;
  }
});

export default AssetPreview;
