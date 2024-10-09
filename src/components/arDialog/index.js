import React, { useEffect, useCallback } from "react";
import { Dialog } from "primereact/dialog";
import Tooltip from "@/components/tooltip";
import IconButton from "@mui/material/IconButton";
import GppMaybeIcon from "@mui/icons-material/GppMaybe";
import ArLoadingButton from "@/components/arLoadingButton";
import "./index.css";

const ArDialog = ({
  title,
  children,
  dialogOpen,
  handleCancel,
  buttonList,
  isIconClose = false,
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
        <div className="flex w-full items-center">
          {title}
          {tooltipText && (
            <Tooltip content={tooltipText} position="top">
              <GppMaybeIcon
                fontSize="inherit"
                className="cursor-pointer mt-[0.35rem] ml-2"
              />
            </Tooltip>
          )}
        </div>
      }
      focusOnShow={true}
      visible={dialogOpen}
      style={{ width, top }}
      onHide={handleCancel}
      footer={renderFooter()}
      blockScroll={!shouldScrollInViewport}
    >
      <div>{children}</div>
    </Dialog>
  );
};

export default ArDialog;
