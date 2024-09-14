/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-07-18 10:06:45
 */
import React, { useRef, useEffect, useState, useCallback } from "react";
import pickUpSvg from "@/assets/layout/pickup.svg";
import newFileSvg from "@/assets/layout/newFile.svg";
import newFolderSvg from "@/assets/layout/newFolder.svg";
import previewSvg from "@/assets/layout/preview.svg";
import redoSvg from "@/assets/layout/redo.svg";
import searchSvg from "@/assets/layout/search.svg";
import undoSvg from "@/assets/layout/undo.svg";
import logSvg from "@/assets/layout/log.svg";
import { IconButton } from "@mui/material";
import Tooltip from "@/components/tooltip";
import Controls from "./controls";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Badge from "@mui/material/Badge";
import {
  useLayout,
  useFileStore,
  redo,
  undo,
  search,
  useUserStore,
  usePdfPreviewStore,
  useEngineStatusStore,
  useCompileSetting,
} from "store";
import { compileLatex } from "@/features/latexCompilation/latexCompilation";
import { EngineStatus } from "@/features/engineStatus/EngineStatus";
import { FileUploader, FolderUploader } from "../upload.jsx";
import UploadFiles from "./uploadFiles";
import * as constant from "@/constant";
import path from "path";
import ArButtonGroup from "@/components/arButtonGroup";
import ArMenuRadix from "@/components/arMenuRadix";

const ContentTopBar = (props) => {
  const {
    showView,
    showXterm,
    showSide,
    showEditor,
    presentation,
    showHeader,

    toggleSide,
    toggleXterm,
    toggleEditor,
    toggleView,
    emitResize,
    showFooter,
    sideWidth,
  } = useLayout();

  const { engineStatus, selectFormattedEngineStatus } = useEngineStatusStore();

  const {
    projectSync,
    sourceCode,
    currentProjectRoot,
    filepath,
    loadFile,
    startFileCreating,
    startDirCreating,
    currentSelectDir,
    updateDirOpen,
    reload,
  } = useFileStore((state) => ({
    projectSync: state.projectSync,
    sourceCode: state.value,
    currentProjectRoot: state.currentProjectRoot,
    filepath: state.filepath,
    loadFile: state.loadFile,
    startFileCreating: state.startFileCreating,
    startDirCreating: state.startDirCreating,
    currentSelectDir: state.currentSelectDir,
    updateDirOpen: state.updateDirOpen,
    reload: state.repoChanged,
  }));

  const { updateSetting, getSetting, compileSetting } = useCompileSetting(
    (state) => ({
      updateSetting: state.updateSetting,
      getSetting: state.getSetting,
      compileSetting: state.compileSetting,
    })
  );

  const { showCompilerLog, toggleCompilerLog, logInfo } = usePdfPreviewStore(
    (state) => ({
      showCompilerLog: state.showCompilerLog,
      toggleCompilerLog: state.toggleCompilerLog,
      logInfo: state.logInfo,
    })
  );

  const messageCount = logInfo.errorsLength + logInfo.warningsLength;
  const badgeColor = logInfo.errorsLength ? "error" : "warning";

  const { user } = useUserStore((state) => ({
    user: state.user,
  }));

  const [isAutoCompile, setIsAutoCompile] = useState(false);

  useEffect(() => {
    autoCompileFirst(() =>
      compileLatex(sourceCode, currentProjectRoot, compileSetting)
    );
  }, [sourceCode, engineStatus, currentProjectRoot, compileSetting]);
  const autoCompileFirst = (compileCallback) => {
    if (
      engineStatus === constant.readyEngineStatus &&
      !isAutoCompile &&
      sourceCode &&
      currentProjectRoot
    ) {
      setIsAutoCompile(true);
      compileCallback && compileCallback();
    }
  };

  const handleActionClick = (key) => {
    switch (key) {
      case "pickUp":
        toggleSide();
        break;
      case "newFile":
        console.log(currentSelectDir, "currentSelectDir");
        updateDirOpen(true);
        if (!currentSelectDir) {
          let dir = path.dirname(filepath);
          startFileCreating(dir);
          break;
        }
        startFileCreating(currentSelectDir);
        break;
      case "newFolder":
        updateDirOpen(true);
        if (!currentSelectDir) {
          let dir = path.dirname(filepath);
          startFileCreating(dir);
          break;
        }
        startDirCreating(currentSelectDir);
        break;
      case "uploadFile":
        break;
      case "redo":
        redo();
        break;
      case "undo":
        undo();
        break;
      case "search":
        search();
        break;
      default:
        break;
    }
  };
  const fileUploaderRef = useRef(null);
  const folderUploaderRef = useRef(null);

  const actionList = React.useMemo(() => {
    return [
      {
        key: "pickUp",
        src: pickUpSvg,
        alt: "Pick Up",
        click: handleActionClick,
      },
      showSide && {
        key: "newFile",
        src: newFileSvg,
        alt: "New File",
        click: handleActionClick,
      },
      showSide && {
        key: "newFolder",
        src: newFolderSvg,
        alt: "New Folder",
        click: handleActionClick,
      },
      {
        key: "uploadFile",
        // src: uploadFileSvg,
        // alt: "Upload File",
        // click: handleActionClick,
      },
      { key: "redo", src: redoSvg, alt: "Redo", click: handleActionClick },
      { key: "undo", src: undoSvg, alt: "Undo", click: handleActionClick },
      {
        key: "search",
        src: searchSvg,
        alt: "Search",
        click: handleActionClick,
      },
    ].filter(Boolean);
  }, [showSide, currentSelectDir]);

  return (
    <div className="flex items-center justify-between bg-[#e8f9ef] w-full">
      <div className="flex items-center pl-2 w-1/2 ">
        {actionList.map((icon) => {
          if (icon.key == "uploadFile") {
            return (
              <React.Fragment>
                <UploadFiles
                  reload={reload}
                  filepath={filepath}
                  currentSelectDir={currentSelectDir}
                  currentProject={currentProjectRoot}
                  title={"Upload File"}
                  projectSync={projectSync}
                  user={user}
                />

                {/* <FileUploader
                  onClick={() => fileUploaderRef.current.click()}
                  reload={reload}
                  filepath={filepath}
                  currentSelectDir={currentSelectDir}
                  currentProject={currentProjectRoot}
                  fontSize="small"
                  ref={fileUploaderRef}
                  title={"Upload File"}
                  projectSync={projectSync}
                ></FileUploader>
                <FolderUploader
                  onClick={() => folderUploaderRef.current.click()}
                  reload={reload}
                  filepath={filepath}
                  currentSelectDir={currentSelectDir}
                  fontSize="small"
                  ref={folderUploaderRef}
                  currentProject={currentProjectRoot}
                  projectSync={projectSync}
                  title="Upload Folder"
                ></FolderUploader> */}
              </React.Fragment>
            );
          }
          return (
            <Tooltip content={icon.alt} id={icon.key} position="bottom">
              <IconButton
                color="#inherit"
                aria-label="toggleView"
                size="small"
                onClick={() => icon.click(icon.key)}
              >
                <img
                  src={icon.src}
                  alt={icon.alt}
                  className="w-5 h-5 cursor-pointer hover:opacity-75"
                />
              </IconButton>
            </Tooltip>
          );
        })}
      </div>
      <div
        className={`flex items-center  justify-between space-x-10 mr-4 w-1/2 `}
        style={{ marginLeft: showSide ? sideWidth + 32 : 32 + "px" }}
      >
        <div className="flex items-center space-x-2">
          <ArButtonGroup className="bg-[#81C784] text-black rounded-md ">
            <button
              className={` text-black px-2 py-[2px] flex items-center space-x-4`}
            >
              <span
                onClick={() =>
                  compileLatex(sourceCode, currentProjectRoot, compileSetting)
                }
              >
                {engineStatus == constant.notReadyEngineStatus ||
                engineStatus == constant.busyEngineStatus
                  ? "Compiling"
                  : "Compile"}
                {/* : "Compile\u2009\u2009\u2009\u2009"} */}
              </span>
              <EngineStatus className="text-[12px]" />
            </button>
            <button className="px-1">
              <ArMenuRadix
                menuAlign="start"
                buttonCom={<ArrowDropDownIcon />}
                // width="10rem"
                items={[
                  {
                    label: "Compiler",
                    separator: true,
                    type: "radio",
                    onSelect: (v) => updateSetting("compiler", v),
                    value: getSetting("compiler"),
                    subMenu: [
                      {
                        label: "XeLaTeX",
                        value: "xeLaTeX",
                      },
                      {
                        label: "pdfLaTeX",
                        value: "pdfLaTeX",
                      },
                    ],
                  },
                  {
                    label: "Compile Error Handling",
                    separator: true,
                    type: "radio",
                    onSelect: (v) => updateSetting("nonstop", v),
                    value: getSetting("nonstop"),
                    subMenu: [
                      {
                        label: "Stop on first error",
                        value: "off",
                      },
                      {
                        label: "Try to compile despite errors",
                        value: "on",
                      },
                    ],
                  },
                ]}
              ></ArMenuRadix>
            </button>
          </ArButtonGroup>

          <Tooltip content={"Compile Log"} position="bottom">
            <IconButton
              color="#inherit"
              aria-label="toggleView"
              size="small"
              className={`flex items-center ${
                showCompilerLog ? "bg-[#81C784]" : ""
              } `}
              onClick={toggleCompilerLog}
            >
              <Badge
                badgeContent={!showCompilerLog ? messageCount : 0}
                color={badgeColor}
              >
                <img
                  src={logSvg}
                  alt=""
                  className="w-5 h-5 cursor-pointer hover:opacity-75"
                />
              </Badge>
            </IconButton>
          </Tooltip>
        </div>
        <div className="flex items-center space-x-2">
          <Tooltip content={"Preview"} position="bottom">
            <IconButton
              color="#inherit"
              aria-label="toggleView"
              size="small"
              onClick={toggleView}
            >
              <img
                src={previewSvg}
                alt=""
                className="w-5 h-5 cursor-pointer hover:opacity-75"
              />
            </IconButton>
          </Tooltip>

          <Controls></Controls>
        </div>
      </div>
    </div>
  );
};

export default ContentTopBar;
