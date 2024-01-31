/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-31 18:28:07
 */
import React, { useState } from "react";
import UpLoadFile from "../../domain/filesystem/commands/upLoadFile";

const FileUploader = () => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    console.log(event.target.files[0], "event.target.files[0]");
    UpLoadFile(event.target.files[0], "test");
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
    </div>
  );
};

export default FileUploader;
