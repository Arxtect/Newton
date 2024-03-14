import React, { useState, useEffect } from "react";
import { IconButton, Button, Menu, MenuItem, Tooltip } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import { EngineStatus } from "@/features/engineStatus/EngineStatus";
import { usePdfPreviewStore, useFileStore } from "@/store";
import { compileLatex } from "@/features/latexCompilation/latexCompilation";
import Controls from "./controls";
import BottomDrawer from "@/features/bottomDrawer/bottomDrawer";
import RightBeforeLeft from "./rightBeforeLeft";
import { existsPath } from "domain/filesystem";
import path from "path";
import LinkGithub from "./linkGithub";

function RightBefore() {
  const {
    filepath,
    createProject,
    currentSelectDir,
    repoChanged,
    deleteProject,
    allProject,
  } = useFileStore((state) => ({
    filepath: state.filepath,
    createProject: state.createProject,
    currentSelectDir: state.currentSelectDir,
    repoChanged: state.repoChanged,
    deleteProject: state.deleteProject,
    allProject: state.allProject,
  }));

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

  // sync
  const [isExistsGit, setIsExistsGit] = useState(false);
  const getIsExistGit = async () => {
    const isExistsGit = await existsPath(path.join(currentProjectRoot, ".git"));
    setIsExistsGit(isExistsGit);
  };
  useEffect(() => {
    getIsExistGit();
  }, [currentProjectRoot]);

  //git control

  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = (open) => {
    setIsOpen(open);
  };

  // link
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);

  return (
    <div className="flex h-full w-full justify-between px-2">
      <div className="w-1/2  flex items-center">
        {/* <RightBeforeLeft
          createProject={createProject}
          currentProject={currentProjectRoot}
          deleteProject={deleteProject}
          projectLists={allProject}
          reload={repoChanged}
          filepath={filepath}
          currentSelectDir={currentSelectDir}
        ></RightBeforeLeft> */}
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
          {!!isExistsGit ? (
            <Tooltip title="Sync">
              <Button
                color="inherit"
                aria-label="log"
                size="small"
                onClick={() => toggleDrawer(true)}
              >
                <span className="flex items-center justify-center w-[20px] h-[20px] text-[14px]">
                  sync
                </span>
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Link a git repository">
              <Button
                color="inherit"
                aria-label="log"
                size="small"
                onClick={() => setGithubDialogOpen(true)}
              >
                <span className="flex items-center justify-center w-[20px] h-[20px] text-[14px]">
                  Link
                </span>
              </Button>
            </Tooltip>
          )}
          {/* <IconButton color="inherit" aria-label="settings" size="small">
            <SettingsIcon fontSize="small" />
          </IconButton> */}
          <Controls></Controls>
        </div>
      </div>
      <LinkGithub
        dialogOpen={githubDialogOpen}
        setDialogOpen={setGithubDialogOpen}
        setIsExistsGit={setIsExistsGit}
      ></LinkGithub>
      <BottomDrawer isOpen={isOpen} toggleDrawer={toggleDrawer} />
    </div>
  );
}

export default RightBefore;
