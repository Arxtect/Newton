import React, { useState, useEffect } from "react";
import { IconButton, Button, Menu, MenuItem, Tooltip } from "@mui/material";
import { EngineStatus } from "@/features/engineStatus/EngineStatus";
import { compileLatex } from "@/features/latexCompilation/latexCompilation";
import Controls from "./controls";

import { findAllProject, getProjectInfo, existsPath } from "domain/filesystem";
import path from "path";
import LinkGithub from "./linkGithub";
import Share from "./share";
import { toast } from "react-toastify";
import {
  updateDialogLoginOpen,
  useUserStore,
  usePdfPreviewStore,
  useFileStore,
} from "@/store";

function RightBefore() {
  const { user } = useUserStore((state) => ({
    user: state.user,
  }));

  const { pdfUrl, toggleCompilerLog } = usePdfPreviewStore((state) => ({
    pdfUrl: state.pdfUrl,
    toggleCompilerLog: state.toggleCompilerLog,
  }));
  const { projectSync, sourceCode, currentProjectRoot, filepath, loadFile } =
    useFileStore((state) => ({
      projectSync: state.projectSync,
      sourceCode: state.value,
      currentProjectRoot: state.currentProjectRoot,
      filepath: state.filepath,
      loadFile: state.loadFile,
    }));

  useEffect(() => {
    return () => {
      console.log(projectSync, "projectSync");
      projectSync?.leaveCollaboration && projectSync?.leaveCollaboration();
    };
  }, [projectSync]);

  const compile = () => compileLatex(sourceCode, currentProjectRoot);

  const showLog = () => {
    toggleCompilerLog();
  };

  // sync
  const [isExistsGit, setIsExistsGit] = useState(false);
  const getIsExistGit = async () => {
    const isExistsGit = await existsPath(path.join(currentProjectRoot, ".git"));
    setIsExistsGit(isExistsGit);
  };
  useEffect(() => {
    getIsExistGit();
  }, [currentProjectRoot]);

  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  const controlShare = async () => {
    const info = await getProjectInfo(currentProjectRoot);
    if (info.userId && info.userId != user.id) {
      toast.warning("This project is collaborative and cannot be shared");
      return;
    }
    if (!user || JSON.stringify(user) === "{}") {
      toast.warning("Please login");
      updateDialogLoginOpen(true);
      return;
    }
    setShareDialogOpen(true);
  };

  return (
    <div className="flex h-full w-full justify-between px-2">
      <div className="w-1/2  flex items-center"></div>
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
          <Tooltip title="Share to collaborate">
            <Button
              color="inherit"
              aria-label="log"
              size="small"
              onClick={() => controlShare()}
            >
              <span className="flex items-center justify-center w-[20px] h-[20px] text-[14px]">
                Share
              </span>
            </Button>
          </Tooltip>
          <LinkGithub></LinkGithub>
          <Controls></Controls>
        </div>
      </div>

      <Share rootPath={currentProjectRoot} user={user}></Share>
    </div>
  );
}

export default RightBefore;
