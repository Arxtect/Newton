import React from "react";
import {
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  InputAdornment,
} from "@mui/material";
import { ArrowDropDown } from "@mui/icons-material";

function DropdownFormWithIcon({
  currentProjectRoot,
  projectList = [],
  changeCurrentProjectRoot,
}) {
  const handleChange = (event) => {
    changeCurrentProjectRoot({ projectRoot: event.target.value });
  };

  return (
    <FormControl variant="outlined" size="small" className="w-4/5 m-auto">
      <InputLabel
        id="simple-select-outlined-label"
        className="h-full"
        // style={{ lineHeight: "100%" }}
      >
        Project
      </InputLabel>
      <Select
        labelId="simple-select-outlined-label"
        value={currentProjectRoot}
        onChange={handleChange}
        label="Project"
        className="text-xs p-0 overflow-hidden"
      >
        {projectList.map((item, index) => {
          return (
            <MenuItem value={item} key={index}>
              {item}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
}

export default DropdownFormWithIcon;
