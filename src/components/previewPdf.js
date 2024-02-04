import React, { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@mui/material";
import { toast } from "react-toastify";

const PreviewPdf = ({
  open,
  pdfUrl,
  setOpen,
  dialogStyle = {
    height: "90vh",
    width: "80vw",
  },
}) => {
  const handleClosePreview = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClosePreview}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        style: dialogStyle,
      }}
    >
      <DialogContent className="p-0">
        <embed
          src={pdfUrl}
          width="100%"
          height="100%"
          type="application/pdf"
          className="h-full w-full"
        />
      </DialogContent>
    </Dialog>
  );
};

export default PreviewPdf;
