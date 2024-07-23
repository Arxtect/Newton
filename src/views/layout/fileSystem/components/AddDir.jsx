/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-26 10:17:19
 */
import React, { useState, useRef, useEffect } from "react";
import { Box, TextField } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import { useFileStore } from "store";

import path from "path";
import { ListItemIcon } from "@mui/material";
import folderCloseSvg from "@/assets/layout/folderClose.svg";


const AddDir = ({ parentDir, depth }) => {
  const { createFile, createDirectory, finishDirCreating, cancelDirCreating } =
    useFileStore((state) => ({
      createFile: state.createFile,
      createDirectory: state.createDirectory,
      finishDirCreating: state.finishDirCreating,
      cancelDirCreating: state.cancelDirCreating,
    }));
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (event) => {
    setValue(event.target.value);
  };

  const handleInputBlur = () => {
    cancelDirCreating({});
  };

  const handleKeyDown = (ev) => {
    if (ev.key === "Escape") {
      cancelDirCreating({});
    }
    if (ev.key === "Enter") {
      if (!value || value == "") {
        cancelDirCreating({});
        return;
      }
      const dirpath = path.join(parentDir, value);
      finishDirCreating({ dirpath });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        paddingLeft: `${(depth + 1) * 8 + 24}px`,
      }}
    >
      <ListItemIcon
        style={{
          minWidth: "unset",
        }}
      >
        {/* <FolderIcon /> */}
        <img src={folderCloseSvg} alt="" />
      </ListItemIcon>
      <TextField
        className="tailwind-classes-for-input"
        variant="outlined"
        size="small"
        value={value}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleKeyDown}
        inputRef={inputRef}
        sx={{
          "& .MuiInputBase-input": {
            height: "24px",
            padding: "0 6px",
          },
        }}
      />
    </Box>
  );
};

export default AddDir;
