/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-06 21:13:41
 */
import React from "react";
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
import ArLoadingButton from './arLoadingButton'

const ArDialog = ({
  title,
  children,
  dialogOpen,
  handleCancel,
  buttonList,
  isIconClose = true,
  width = "50vw",
}) => {
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
      <DialogTitle>{title}</DialogTitle>
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
          <ArLoadingButton key={index} onClick={button.click} color="primary" loading={button?.loading}>
            {button.title}
          </ArLoadingButton>
        ))}
      </DialogActions>
    </Dialog>
  );
};

export default ArDialog;
