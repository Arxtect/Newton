/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-07 22:20:16
 */
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { useMemo } from "react";

export default function ArSelect({ inputSize, label, options, value, onChange,className, sx, ...props }) {

  return (
    <FormControl
      fullWidth
      variant="outlined"
      size="small"
      className={className}
    >
      {label && (
        <InputLabel
      
         id="demo-multiple-checkbox-label"
        >
          {label}
        </InputLabel>
      )}
      <Select
         labelId="demo-multiple-checkbox-label"
        label={label}
        value={value}
        onChange={onChange}
        
        {...props}
      >
        {options.map((option, index) => (
          <MenuItem key={option.key} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}