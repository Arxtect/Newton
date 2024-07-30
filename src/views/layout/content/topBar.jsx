/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-07-18 10:06:45
 */
import React, { useRef } from "react";
import pickUpSvg from "@/assets/layout/pickup.svg";
import newFileSvg from "@/assets/layout/newFile.svg";
import newFolderSvg from "@/assets/layout/newFolder.svg";
import layoutSvg from "@/assets/layout/layout.svg";
import previewSvg from "@/assets/layout/preview.svg";
import redoSvg from "@/assets/layout/redo.svg";
import searchSvg from "@/assets/layout/search.svg";
import undoSvg from "@/assets/layout/undo.svg";
import uploadFileSvg from "@/assets/layout/uploadFile.svg";
import successSvg from "@/assets/layout/success.svg";
import { Select, MenuItem, IconButton, Tooltip } from "@mui/material";
import Controls from "./controls";
import { useLayout, useFileStore, redo, undo, search } from "store";
import { compileLatex } from "@/features/latexCompilation/latexCompilation";
import { EngineStatus } from "@/features/engineStatus/EngineStatus";
import { FileUploader, FolderUploader } from "../upload.jsx";

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
    reload: state.reload,
  }));

  const compile = () => compileLatex(sourceCode, currentProjectRoot);

  const widthOption = [
    {
      value: "100%",
      name: "100%",
    },
    {
      value: "75%",
      name: "75%",
    },
    {
      value: "50%",
      name: "50%",
    },
    {
      value: "25%",
      name: "25%",
    },
  ];

  const handleActionClick = (key) => {
    switch (key) {
      case "pickUp":
        toggleSide();
        break;
      case "newFile":
        updateDirOpen(true);
        startFileCreating(currentSelectDir);
        break;
      case "newFolder":
        updateDirOpen(true);
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
  }, [showSide]);

  return (
    <div className="flex items-center justify-between bg-[#e8f9ef] w-full">
      <div className="flex items-center pl-2 w-1/2">
        {actionList.map((icon) => {
          if (icon.key == "uploadFile") {
            return (
              <React.Fragment>
                <FileUploader
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
                ></FolderUploader>
              </React.Fragment>
            );
          }
          return (
            <Tooltip title={icon.alt} id={icon.key}>
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
        <button
          className={`bg-[#81C784] text-black px-2 rounded-md flex items-center space-x-4 `}
        >
          <span onClick={compile}>Compile</span>
          <EngineStatus className="text-[12px]" />
        </button>
        <div className="flex items-center space-x-2">
          {/* <Select
            labelId="tag-label"
            id="demo-simple-select"
            variant="outlined"
            value="100%"
            sx={{
              height: "24px",
              minWidth: "70px",
              padding: "0",
              textAlign: "center",
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  textAlign: "center",
                },
              },
            }}
          >
            {widthOption.map((option) => (
              <MenuItem
                key={option.name}
                value={option.name}
                sx={{ padding: "2px 10px" }}
              >
                {option.name}
              </MenuItem>
            ))}
          </Select> */}

          <Tooltip title={"Preview"}>
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
