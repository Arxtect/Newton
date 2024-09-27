/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-06 21:13:41
 */
import React, { useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Divider,
} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import ArLoadingButton from "./arLoadingButton";
import Tooltip from "@mui/material/Tooltip";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";

const ArDialog = ({
  title,
  children,
  dialogOpen,
  handleCancel,
  buttonList,
  isIconClose = true,
  tooltipText,
  width = "50vw",
}) => {
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter") {
        const saveButton = buttonList.find(
          (button) => button.title.toLowerCase() === "save"
        );
        if (saveButton) {
          saveButton.click();
        }
      }
    },
    [buttonList]
  );

  useEffect(() => {
    if (dialogOpen) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dialogOpen, handleKeyDown]);

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleCancel}
      PaperProps={{
        sx: {
          width: width,
          maxWidth: "none",
        },
      }}
    >
      <DialogTitle>
        {title}
        {tooltipText && (
          <Tooltip title={tooltipText}>
            <IconButton aria-label="warning">
              <GppMaybeIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        )}
      </DialogTitle>
      {isIconClose && (
        <IconButton
          aria-label="close"
          onClick={handleCancel}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      )}
      <DialogContent dividers>{children}</DialogContent>
      <DialogActions>
        {buttonList.map((button, index) => (
          <ArLoadingButton
            key={index}
            onClick={button.click}
            color="primary"
            loading={button?.loading}
            className="text-arxTheme"
          >
            {button.title}
          </ArLoadingButton>
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default ArDialog;
