/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-06 22:15:21
 */
import React, { useState } from "react";
import { useFileStore } from "store";
import { toast } from "react-toastify";
import { uploadZip } from "domain/filesystem";
import path from "path";
import { useNavigate } from "react-router-dom";
import FileUploader from "@/features/uploadFiles";

const UploadProject = ({ dialogOpen, setDialogOpen, user }) => {
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
      try {
        await uploadZip(file, ".", repoChanged, projectName, onProgress, user);
        toast.success("Project uploaded successfully");
        setDialogOpen(false);
        navigate(`/newton`);
      } catch (error) {
        toast.error(error.message || "An error occurred during upload");
      }
    }
  };

  const handleDrop = (event) => {
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

  return (
    <FileUploader
      dialogOpen={dialogOpen}
      setDialogOpen={setDialogOpen}
      user={user}
      repoChanged={repoChanged}
      handleUpload={handleUpload}
      uploadProgress={uploadProgress}
      handleDrop={handleDrop}
    ></FileUploader>
  );
};

export default UploadProject;
