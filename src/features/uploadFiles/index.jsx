/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-08-07 10:13:08
 */
import React, { useState } from "react";
import Header from "./header";
import DropZone from "./dropZone";
import ActionButtons from "./actionButton";
import { uploadZip } from "domain/filesystem";
import path from "path";
import ArDialog from "@/components/arDialog";
import {
  Button,
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import UploadProgressBar from "./uploadProgressBar";

function FileUploader({
  dialogOpen,
  setDialogOpen,
  repoChanged,
  user,
  handleUpload,
  uploadProgress,
  otherHandleInCancle,
  title = "Upload Zipped Project",
  type = "zip",
  ...props
}) {
  const handleDragOver = (event) => {
    event.preventDefault(); // 阻止默认行为
    setIsDragOver(true);
  };

  const handleCancelUpload = () => {
    setDialogOpen(false);
    otherHandleInCancle && otherHandleInCancle();
  };

  // 处理文件放置的事件
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    props.handleDrop(event);
  };
  const [isDragOver, setIsDragOver] = useState(false);

  // 拖拽进入时的处理函数
  const handleDragEnter = (event) => {
    event.preventDefault();
    setIsDragOver(true); // 设置拖拽状态为true
  };

  // 拖拽离开时的处理函数
  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false); // 设置拖拽状态为false
  };
  const handleDragEnd = (event) => {
    event.preventDefault();
    console.log("Drag end event", event);
    setIsDragOver(false);
  };
  return (
    <ArDialog
      title={title}
      dialogOpen={dialogOpen}
      handleCancel={handleCancelUpload}
      buttonList={[{ title: "Cancel", click: handleCancelUpload }]}
    >
      <div className="flex flex-col font-medium text-center text-black rounded-none max-w-[760px]">
        <div className="flex flex-col px-4 w-full text-sm leading-none max-md:px-5 max-md:max-w-full">
          <Box
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            className={`flex flex-col items-center justify-center p-4 border-2 py-10 ${
              isDragOver ? "border-blue-500 bg-blue-100" : "border-dashed"
            }`}
          >
            <DropZone handleUpload={handleUpload} type={type} />
          </Box>
          <ActionButtons handleUpload={handleUpload} type={type} />
        </div>
      </div>
      {uploadProgress > 0 && <UploadProgressBar progress={uploadProgress} />}
    </ArDialog>
  );
}

export default FileUploader;
