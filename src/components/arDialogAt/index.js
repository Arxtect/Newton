import React, { useEffect, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Tooltip from "@mui/material/Tooltip";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";
import ArLoadingButton from "@/components/arLoadingButton";

const ArDialog = ({
  title,
  children,
  dialogOpen,
  handleCancel,
  buttonList,
  isIconClose = true,
  tooltipText,
  width = "50vw",
  shouldScrollInViewport,
  top,
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

  const renderFooter = () => (
    <div>
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
    </div>
  );

  return (
    <Dialog
      header={
        <div>
          {tooltipText && (
            <Tooltip title={tooltipText}>
              <IconButton aria-label="warning">
                <GppMaybeIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
          <span>{title}</span>
        </div>
      }
      focusOnShow={true}
      visible={dialogOpen}
      style={{ width, top }}
      onHide={handleCancel}
      footer={renderFooter()}
      className="custom-modal"
      blockScroll={!shouldScrollInViewport}
    >
      <div>
        {tooltipText && (
          <Tooltip title={tooltipText}>
            <IconButton aria-label="warning">
              <GppMaybeIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        )}
        <div>{children}</div>
      </div>
    </Dialog>
  );
};

export default ArDialog;
