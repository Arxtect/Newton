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

import HoverMenu from "./HoverMenu";
import ArIcon from "@/components/arIcon";

import ContextMenu from "@/components/contextMenu";

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
  } = useFileStore((state) => ({
    editorValue: state.value,
    saveFile: state.saveFile,
    editingFilepath: state.filepath,
    currentSelectDir: state.currentSelectDir,
    deleteFile: state.deleteFile,
    renamingPathname: state.renamingPathname,
    isDropFileSystem: state.isDropFileSystem,
  }));
  const basename = path.basename(filepath);

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
    startRenaming({ pathname: filepath });
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, [0]);
  }, [filepath, inputRef, startRenaming]);

  const handleKeyDown = (ev) => {
    if (ev.key === "Escape") {
      endRenaming();
      setValue(basename);
    } else if (ev.key === "Enter") {
      handleRenameConfirm(value);
    }
  };

  const menuItems = useMemo(() => {
    return [
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
        label: "Delete",
        command: () => {
          setHovered(false);
          deleteFile({ filename: filepath });
        },
        icon: "FileDelete",
      },
    ];
  }, [filepath, deleteFile, handleRename]);

  const handleMouseEnter = (e) => {
    setHovered(true);
  };

  const handleMouseLeave = (e) => {
    setHovered(false);
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
            selected={editingFilepath === filepath && currentSelectDir == ""}
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
                onClick={async (e) => {
                  e.preventDefault();
                  await loadFile({ filepath });
                  if (isMobile) {
                    pushScene({ nextScene: "edit" });
                  }
                }}
              >
                <ListItemIcon
                  style={{
                    minWidth: "unset",
                  }}
                >
                  <ArIcon name={"File"} className="text-black w-[1.5rem]" />
                </ListItemIcon>
                <Pathname ignoreGit={ignoreGit}>{basename}</Pathname>
              </div>
              <HoverMenu
                dirpath={filepath}
                onDelete={(e) => {
                  e.stopPropagation();
                  deleteFile({ filename: filepath });
                }}
                onRename={(e) => {
                  e.stopPropagation();
                  handleRename();
                }}
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
