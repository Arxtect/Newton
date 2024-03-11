import React, { useState } from "react";
import { IconButton, Button, Menu, MenuItem } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { EngineStatus } from "@/features/engineStatus/EngineStatus";
import { usePdfPreviewStore, useFileStore } from "@/store";
import { compileLatex } from "@/features/latexCompilation/latexCompilation";
import Controls from "./controls";

function RightBefore() {
  const { pdfUrl, toggleCompilerLog } = usePdfPreviewStore((state) => ({
    pdfUrl: state.pdfUrl,
    toggleCompilerLog: state.toggleCompilerLog,
  }));
  const { sourceCode, changeValue, currentProjectRoot } = useFileStore(
    (state) => ({
      sourceCode: state.value,
      changeValue: state.changeValue,
      currentProjectRoot: state.currentProjectRoot,
    })
  );

  const compile = () => compileLatex(sourceCode, currentProjectRoot);

  const showLog = () => {
    toggleCompilerLog();
  };

  //menu
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="flex h-full w-full justify-between px-2">
      <div className="w-1/2  flex items-center">
        <div></div>
      </div>
      <div className="w-1/2 flex justify-between items-center pr-2">
        <div className="flex justify-center items-center">
          <Button
            color="inherit"
            aria-label="log"
            size="small"
            className="mx-2"
            onClick={compile}
          >
            <span className="flex items-center justify-center w-[20px] h-[20px] text-[14px]">
              COMPILE
            </span>
          </Button>
          <EngineStatus className="text-[12px]" />
        </div>
        <div>
          <Button color="inherit" aria-label="log" size="small">
            <span className="flex items-center justify-center w-[20px] h-[20px] text-[14px]">
              sync
            </span>
          </Button>
          <IconButton color="inherit" aria-label="settings" size="small">
            <SettingsIcon fontSize="small" />
          </IconButton>
          <Controls></Controls>
        </div>
      </div>
    </div>
  );
}

export default RightBefore;
