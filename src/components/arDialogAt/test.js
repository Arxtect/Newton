/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-09-26 22:04:01
 */
import React, { useState } from "react";
import ArDialog from "./ArDialog"; // 确保路径正确
import Button from "@mui/material/Button";

const ParentComponent = () => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleOpen = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const buttonList = [
    {
      title: "Save",
      click: () => {
        console.log("Save button clicked");
        handleClose();
      },
      loading: false,
    },
    {
      title: "Cancel",
      click: handleClose,
      loading: false,
    },
  ];

  return (
    <div>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Open Dialog
      </Button>
      <ArDialog
        title="Dialog Title"
        dialogOpen={dialogOpen}
        handleCancel={handleClose}
        buttonList={buttonList}
        isIconClose={true}
        tooltipText="This is a tooltip"
        width="50vw"
      >
        <div>
          <p>This is the content of the dialog.</p>
          <input label="Input Field" variant="outlined" fullWidth />
        </div>
      </ArDialog>
    </div>
  );
};

export default ParentComponent;
