/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-06 21:13:41
 */
import React, { useEffect, useCallback } from "react";
import ModalDialog, { ModalTransition } from "@atlaskit/modal-dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
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

  const actions = buttonList.map((button, index) => ({
    text: button.title,
    onClick: button.click,
    isLoading: button?.loading,
  }));

  return (
    <ModalTransition>
      {dialogOpen && (
        <ModalDialog
          heading={title}
          onClose={handleCancel}
          actions={actions}
          width={width}
        >
          {tooltipText && (
            <Tooltip title={tooltipText}>
              <IconButton aria-label="warning">
                <GppMaybeIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
          {isIconClose && (
            <IconButton
              aria-label="close"
              onClick={handleCancel}
              style={{
                position: "absolute",
                right: 8,
                top: 8,
                color: "grey",
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
          <div>{children}</div>
        </ModalDialog>
      )}
    </ModalTransition>
  );
};

export default ArDialog;
