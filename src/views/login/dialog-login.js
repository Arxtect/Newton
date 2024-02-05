/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-02-05 17:30:32
 */
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@mui/material";
import { toast } from "react-toastify";
import { useLoginStore } from "store";
import NoRouteLogin from "./noRouteLogin";
const DialogLogin = ({
  dialogStyle = {
    height: "65vh",
    width: "60vw",
  },
}) => {
  const { dialogLoginOpen, updateDialogLoginOpen } = useLoginStore((state) => ({
    dialogLoginOpen: state.dialogLoginOpen,
    updateDialogLoginOpen: state.updateDialogLoginOpen,
  }));

  const handleClosePreview = () => {
    updateDialogLoginOpen(false);
  };

  return (
    <Dialog
      open={dialogLoginOpen}
      onClose={handleClosePreview}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        style: dialogStyle,
      }}
    >
      <NoRouteLogin handleClose={handleClosePreview}></NoRouteLogin>
    </Dialog>
  );
};

export default DialogLogin;
