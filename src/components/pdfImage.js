/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-02-26 20:29:27
 */
import React, { useState, useEffect } from "react";
import { pdfjs } from "react-pdf";
import Skeleton from "@mui/material/Skeleton";
import { getPreViewUrl } from "@/util";

// 设置 pdf.js 的 worker，这是必须的步骤
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PfdImage = ({ storageKey, height = 250, ...res }) => {
  const [pageImage, setPageImage] = useState("");

  const getImage = async () => {
    if (!storageKey) return;
    // const response = await getPreviewPdfUrl(storageKey);
    // const fileUrl = response.data.preview;
    const fileUrl = getPreViewUrl(storageKey);
    const loadingTask = pdfjs.getDocument({
      url: fileUrl,
      disableAutoFetch: true,
      disableStream: true,
      rangeChunkSize: 1,
    });

    loadingTask.promise.then(
      (pdf) => {
        // 获取第一页
        pdf.getPage(1).then((page) => {
          // 准备渲染第一页的参数
          var viewport = page.getViewport({ scale: 1 });
          var canvas = document.createElement("canvas");
          var context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // 渲染 PDF 页面到 canvas 上下文中
          var renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          var renderTask = page.render(renderContext);

          renderTask.promise.then(() => {
            // 将渲染好的 canvas 转换为图像数据 URL
            var imgSrc = canvas.toDataURL();
            setPageImage(imgSrc);
          });
        });
      },
      (reason) => {
        // PDF 加载错误
        console.error(reason);
      }
    );
  };

  useEffect(() => {
    getImage();
  }, [storageKey]);

  return (
    <React.Fragment>
      {pageImage ? (
        <img src={pageImage} alt="PDF thumbnail" className="w-full" {...res} />
      ) : (
        <Skeleton variant="rectangular" width="100%" height={height} />
      )}
    </React.Fragment>
  );
};

export default PfdImage;
