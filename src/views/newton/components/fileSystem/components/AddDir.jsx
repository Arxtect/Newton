/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-26 10:17:19
 */
import React, { useState, useRef, useEffect } from "react";
import { Box, TextField } from "@mui/material";
import { useFileStore } from "store";

import path from "path";
import { ListItemIcon } from "@mui/material";
import ArIcon from "@/components/arIcon";

const AddDir = ({ parentDir, depth, inputRef }) => {
  const { createFile, createDirectory, finishDirCreating, cancelDirCreating } =
    useFileStore((state) => ({
      createFile: state.createFile,
      createDirectory: state.createDirectory,
      finishDirCreating: state.finishDirCreating,
      cancelDirCreating: state.cancelDirCreating,
    }));
  const [value, setValue] = useState("");


  const handleInputChange = (event) => {
    setValue(event.target.value);
  };

  const handleInputBlur = () => {
    // cancelDirCreating({});
    handleDirCreate(parentDir, value);
  };

  const handleKeyDown = (ev) => {
    if (ev.key === "Escape") {
      cancelDirCreating({});
    }
    if (ev.key === "Enter") {
      handleDirCreate(parentDir, value);
    }
  };

  const handleDirCreate = (parentDir, value) => {
    if (!value || value == "") {
      cancelDirCreating({});
      return;
    }
    const dirpath = path.join(parentDir, value);
    finishDirCreating({ dirpath });
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
        <ArIcon name={"FolderClose"} className="text-black w-[1.5rem]" />
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
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: "#81C784",
            },
            "&:hover fieldset": {
              borderColor: "#81C784",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#81C784",
            },
          },
        }}
      />
    </Box>
  );
};

export default AddDir;
