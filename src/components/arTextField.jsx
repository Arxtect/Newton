/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-07 22:20:16
 */
import { TextField, Box } from "@mui/material";
import { useMemo } from "react";

export default function ArTextField({ inputSize, sx,inputProps,defaultValue, ...props }) {
  const getHeight = () => {
    switch (inputSize) {
      case "small":
        return "32px";
      case "middle":
        return "40px";
      case "large":
        return "48px";
      default:
        return "32px";
    }
  };

  const commonStyles = useMemo(() => {
    return {
      height: getHeight(),
      ".MuiInputBase-root": { height: getHeight() },
      ".MuiButton-root": { height: getHeight(), lineHeight: getHeight() },
      ".MuiInputLabel-root": {
        lineHeight: "1",
        "&.MuiInputLabel-shrink": {
          transform: "translate(14px, -6px) scale(0.75)",
        },
      },
      ".MuiFormControl-root": {
        lineHeight: "1",
        "&.MuiInputLabel-shrink": {
          transform: "translate(14px, -6px) scale(0.75)",
        },
      },
    };
  }, [inputSize]);

  return (
    <TextField
      fullWidth
      size="small"
      variant="outlined"
      inputProps={{
        style: { height: getHeight() },
        ...inputProps,
      }}
      defaultValue={defaultValue}
      sx={
        getHeight() == "32px"
          ? {
              ...sx,
              ...commonStyles,
            }
          : sx
      }
      {...props}
    />
  );
}
