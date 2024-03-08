/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-07 22:20:16
 */
import { TextField } from "@mui/material";

const commonStyles = {
  height: "32px",
  ".MuiInputBase-root": { height: "32px" },
  ".MuiButton-root": { height: "32px", lineHeight: "32px" },
  ".MuiInputLabel-root": {
    lineHeight: "1", // Set line height to 1 for all label states
    "&.MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.75)", // Adjust label position when shrunk
    },
  },
  ".MuiFormControl-root": {
    lineHeight: "1", // Set line height to 1 for all label states
    "&.MuiInputLabel-shrink": {
      transform: "translate(14px, -6px) scale(0.75)", // Adjust label position when shrunk
    },
  },
};

export default function ArTextField(props) {
  return (
    <TextField
      fullWidth
      size="small"
      variant="outlined"
      InputLabelProps={{
        style: { lineHeight: "1" },
      }}
      InputProps={{
        style: { height: "32px" },
      }}
      sx={commonStyles}
      {...props}
    />
  );
}
