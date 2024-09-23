import React, { useState, useRef, useEffect } from "react";
import { Box, TextField } from "@mui/material";
import path from "path";
import { useFileStore } from "store";
import { ListItemIcon } from "@mui/material";
import ArIcon from "@/components/arIcon";

const AddFile = ({ parentDir, depth }) => {
  const {
    createFile,
    createDirectory,
    finishFileCreating,
    cancelFileCreating,
  } = useFileStore((state) => ({
    createFile: state.createFile,
    createDirectory: state.createDirectory,
    finishFileCreating: state.finishFileCreating,
    cancelFileCreating: state.cancelFileCreating,
  }));

  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleBlur = () => {
    cancelFileCreating();
  };

  const handleKeyDown = (ev) => {
    if (ev.key === "Escape") {
      cancelFileCreating();
    } else if (ev.key === "Enter") {
      if (!value || value == "") {
        cancelFileCreating({});
        return;
      }
      const filepath = path.join(parentDir, value);
      finishFileCreating({ filepath });
    }
  };

  return (
    <Box
      className="inline-block flex"
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
          <ArIcon name={"File"} className="text-black w-[1.5rem]" />
          </ListItemIcon>
      <TextField
        className="tailwind-classes-for-input"
        variant="outlined"
        size="small"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
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

export default AddFile;
