import React, { useState, useEffect } from "react";
import { pdfjs } from "react-pdf";

// 设置 pdf.js 的 worker，这是必须的步骤
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

const PDFThumbnail = ({ fileUrl }) => {
  const [pageImage, setPageImage] = useState("");

  useEffect(() => {
    // 创建 PDF 文档加载任务
    const loadingTask = pdfjs.getDocument(fileUrl);

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
  }, [fileUrl]);

  return (
    <React.Fragment>
      {pageImage && (
        <img src={pageImage} alt="PDF thumbnail" className="v-full" />
      )}
    </React.Fragment>
  );
};

export default PDFThumbnail;
