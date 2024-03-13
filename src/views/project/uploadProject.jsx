/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-06 22:15:21
 */
import React, { useState } from "react";
import {
  Button,
  Box,
  CircularProgress,
  LinearProgress,
  Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ArDialog from "@/components/arDialog";
import { useFileStore } from "store";
import { toast } from "react-toastify";
import { uploadZip } from "domain/filesystem";
import path from "path";
import { useNavigate } from "react-router-dom";

// Upload Progress Bar component
const UploadProgressBar = ({ progress }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      mt={1}
      border="1px solid lightgray"
      borderRadius="4px"
      position="relative"
    >
      <Box width="100%" position="absolute" top={0} left={0}>
        <LinearProgress
          variant="determinate"
          value={progress * 100}
          className="color-[#176cd0] h-[2px]"
        />
      </Box>
      <Box display="flex" p={1.5}>
        <CircularProgress size={20} thickness={5} className="color-[#176cd0]" />
        <Typography variant="body2" ml={1}>
          {`Uploading: ${Math.round(progress * 100)}%`}
        </Typography>
      </Box>
    </Box>
  );
};

const UploadProject = ({ dialogOpen, setDialogOpen }) => {
  const navigate = useNavigate();
  const { repoChanged } = useFileStore((state) => ({
    repoChanged: state.repoChanged,
  }));

  const [uploadProgress, setUploadProgress] = useState(0);

  const handleCancelUpload = () => {
    setDialogOpen(false);
  };

  const handleUpload = async (file) => {
    console.log(file, "file");

    if (file) {
      const onProgress = (progress, entryName) => {
        setUploadProgress(progress);
      };
      const projectName = path.parse(file.name)?.name;
      await uploadZip(file, ".", repoChanged, projectName, onProgress)
        .then(() => {
          toast.success("Project uploaded successfully");
          setDialogOpen(false);
          navigate(`/arxtect`);
        })
        .catch((error) => {
          toast.error(error.message);
        });
    }
  };
  const handleDragOver = (event) => {
    event.preventDefault(); // 阻止默认行为
  };

  // 处理文件放置的事件
  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0]; // 获取第一个文件
      console.log(file.type, "file.type");
      if (
        [
          "application/zip",
          "application/x-zip-compressed",
          "application/octet-stream",
        ].includes(file.type)
      ) {
        handleUpload(file); // 调用父组件传入的上传方法
      } else {
        toast.warning("Please select a .zip file");
      }
    }
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
    setIsDragOver(false);
  };
  return (
    <ArDialog
      title="Upload Zipped Project"
      dialogOpen={dialogOpen}
      handleCancel={handleCancelUpload}
      buttonList={[{ title: "Cancel", click: handleCancelUpload }]}
    >
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
        <Button
          component="label"
          variant="contained"
          startIcon={<CloudUploadIcon />}
        >
          Select a .zip file
          <input
            type="file"
            className="hidden"
            accept=".zip"
            onChange={(e) => handleUpload(e.target.files[0])}
          />
        </Button>
        <p className="my-4">or</p>
        <p>Drag a .zip file here</p>
      </Box>
      {uploadProgress > 0 && <UploadProgressBar progress={uploadProgress} />}
    </ArDialog>
  );
};

export default UploadProject;
