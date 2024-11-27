import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import fs from "fs";
import path from "path";
import pify from "pify";
import Draggable from "./Draggable"; // Adjust the import path as needed
import Pathname from "./Pathname"; // Adjust the import path as needed
import { ListItemIcon } from "@mui/material";
import { Box, TextField } from "@mui/material";
import { useFileStore } from "store";
import { downloadFileFromPath } from "@/domain/filesystem";

import HoverMenu from "./HoverMenu";
import ArIcon from "@/components/arIcon";

import ContextMenu from "@/components/contextMenu";
import { toast } from "react-toastify";

const Container = ({ selected, children }) => {
  // Define the base classes for the component
  const baseClasses = "cursor-pointer";

  // Define the dynamic classes based on the `selected` prop
  const hoverClasses = selected ? "bg-[#81c784]" : "hover:bg-[#bae6bc5c]";

  return <div className={`${baseClasses} ${hoverClasses}`}>{children}</div>;
};

const FileLine = ({
  depth,
  filepath,
  isMobile,
  loadFile,
  fileMoved,
  pushScene,
  ignoreGit,
  startRenaming,
  endRenaming,
}) => {
  const [hovered, setHovered] = useState(false);

  const {
    editorValue,
    saveFile,
    deleteFile,
    editingFilepath,
    currentSelectDir,
    renamingPathname,
    isDropFileSystem,
    assetsFilePath,
    setMainFile,
    mainFilepath,
    selectedFiles,
    toggleFileSelection,
    clearFileSelection
  } = useFileStore((state) => ({
    editorValue: state.value,
    saveFile: state.saveFile,
    editingFilepath: state.filepath,
    currentSelectDir: state.currentSelectDir,
    deleteFile: state.deleteFile,
    renamingPathname: state.renamingPathname,
    isDropFileSystem: state.isDropFileSystem,
    assetsFilePath: state.assetsFilePath,
    setMainFile: state.setMainFile,
    mainFilepath: state.mainFilepath,
    selectedFiles: state.selectedFiles,
    toggleFileSelection: state.toggleFileSelection,
    clearFileSelection: state.clearFileSelection
  }));
  const basename = path.basename(filepath);
  console.log(selectedFiles);
  console.log(selectedFiles.constructor.name); // 输出Set
  console.log(selectedFiles instanceof Set);   // 输出true

  const handleRenameConfirm = async (value) => {
    if (!value || value == "") {
      endRenaming();
      return;
    }
    const dirname = path.dirname(filepath);
    const destPath = path.join(dirname, value);
    await pify(fs.rename)(filepath, destPath);

    endRenaming();
    setValue(value);
    fileMoved({ fromPath: filepath, destPath });
  };

  const [value, setValue] = useState(basename);
  const inputRef = useRef(null);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleBlur = () => {
    // endRenaming();
    handleRenameConfirm(value);
  };
  const handleRename = useCallback(() => {
    if (!inputRef.current && !filepath) return;
    startRenaming({ pathname: filepath });
    renameSection(filepath);
  }, [filepath, inputRef, startRenaming]);

  const handleSetMainFile = useCallback(() => {
    if (!inputRef.current && !filepath) return;
    setMainFile(filepath);
  }, [filepath, inputRef]);

  const renameSection = (filepath) => {
    setTimeout(() => {
      const basename = path.basename(filepath);
      const filenameNoExt = path.parse(basename).name;
      inputRef.current.focus();
      inputRef.current.setSelectionRange(0, filenameNoExt?.length);
    }, 0);
  };

  const handleKeyDown = (ev) => {
    if (ev.key === "Escape") {
      endRenaming();
      setValue(basename);
    } else if (ev.key === "Enter") {
      handleRenameConfirm(value);
    }
  };

  const menuItems = useMemo(() => {
    let isTex = path.extname(filepath) == ".tex";
    return [
      isTex && {
        label: "Set as Main",
        command: (e) => {
          e.stopPropagation();
          setHovered(false);
          handleSetMainFile();
        },
        icon: "TextFile",
      },
      {
        label: "Rename",
        command: (e) => {
          e.stopPropagation();
          setHovered(false);
          handleRename();
        },
        icon: "FileRename",
      },
      {
        label: "Download",
        command: (e) => {
          e.stopPropagation();
          setHovered(false);
          downloadFileFromPath(filepath);
        },
        icon: "DownloadProject",
      },
      {
        label: "Delete",
        command: () => {
          setHovered(false);
          deleteFile({ filename: filepath });
        },
        icon: "FileDelete",
      },
    ].filter((item) => item?.label);
  }, [filepath, deleteFile, handleRename, handleSetMainFile]);

  const handleMouseEnter = (e) => {
    setHovered(true);
  };

  const handleMouseLeave = (e) => {
    setHovered(false);
  };

  
  const handleFileClick = (e) => {
    e.preventDefault(); // 防止默认行为
    if (e.ctrlKey || e.metaKey) {
      toggleFileSelection(filepath); // 多选逻辑
    } else {
      clearFileSelection();
      loadFile({ filepath }); // 加载文件
      if (isMobile) {
        pushScene({ nextScene: "edit" }); // 移动设备场景切换
      }
    }
  };
  

  const onRename = (e) => {
    e.stopPropagation();
    handleRename();
  };
  if (renamingPathname === filepath) {
    return (
      <Box
        className="inline-block flex"
        sx={{
          display: "flex",
          alignItems: "center",
          padding: "1px 0px",
          paddingLeft: `${depth * 8 + 24}px`,
        }}
      >
        <ListItemIcon
          style={{
            minWidth: "unset",
          }}
        >
          <ArIcon name={"File"} className="text-black w-[1.5rem]" />
        </ListItemIcon>
        <TextField
          className="tailwind-classes-for-input"
          variant="outlined"
          size="small"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
          sx={{
            "& .MuiInputBase-input": {
              height: "24px",
              padding: "0 6px",
            },
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: "#81C784",
              },
              "&:hover fieldset": {
                borderColor: "#81C784",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#81C784",
              },
            },
          }}
        />
      </Box>
    );
  }

  return (
    <ContextMenu items={menuItems}>
      <div id="file" className="block p-[0px] w-full h-full">
        <Draggable
          pathname={filepath}
          type="file"
          onDrop={async (result) => {
            if (result) {
              fileMoved(result);
            }
          }}
          isEnabled={isDropFileSystem}
          onDropByOther={() => {
            // Do nothing yet
          }}
        >
          <Container
            selected={
              selectedFiles.includes(filepath)// Multi-select condition
            }
          >
            <div
              className="flex items-center"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div
                className="flex items-center w-full"
                style={{
                  padding: "1px 0px",
                  paddingLeft: `${depth * 8 + 24}px`,
                }}
                onClick={handleFileClick}
                onDoubleClick={(e) => {
                  if (
                    filepath !== editingFilepath &&
                    filepath !== assetsFilePath
                  ) {
                    return;
                  }
                  onRename(e);
                }}
              >
                <ListItemIcon
                  style={{
                    minWidth: "unset",
                  }}
                >
                  <ArIcon name={"File"} className="text-black w-[1.5rem]" />
                </ListItemIcon>
                <Pathname ignoreGit={ignoreGit}>
                  {basename}
                  {path.basename(mainFilepath) == basename && (
                    <span
                      style={{
                        marginLeft: "4px",
                        fontSize: "0.8em",
                        color: "lightgray",
                      }}
                    >
                      main
                    </span>
                  )}
                </Pathname>
              </div>
              <HoverMenu
                dirpath={filepath}
                onDelete={(e) => {
                  e.stopPropagation();
                  deleteFile({ filename: filepath });
                }}
                onRename={onRename}
                menuItems={menuItems}
                hovered={hovered}
              />
            </div>
          </Container>
        </Draggable>
      </div>
    </ContextMenu>
  );
};

export default FileLine;
