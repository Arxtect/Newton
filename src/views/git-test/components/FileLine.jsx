import React, { useState, useEffect, useRef } from "react";
import { Icon, Menu, MenuItem } from "@mui/material";
import fs from "fs";
import path from "path";
import pify from "pify";
import Draggable from "./Draggable"; // Adjust the import path as needed
import Pathname from "./Pathname"; // Adjust the import path as needed
import FileIcon from "@mui/icons-material/InsertDriveFile"; // Assuming you have a FileIcon component
import { ListItemIcon } from "@mui/material";
import { Box, TextField } from "@mui/material";

import ContextMenu from "@mui/material/Menu";
import ContextMenuItem from "@mui/material/MenuItem";
import ContextMenuTrigger from "@mui/material/IconButton";
import { useFileStore } from "store";

import HoverMenu from "./HoverMenu";

const Container = ({ selected, children }) => {
  // Define the base classes for the component
  const baseClasses = "cursor-pointer";

  // Define the dynamic classes based on the `selected` prop
  const hoverClasses = selected ? "bg-gray-100" : "hover:bg-gray-100";

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

  const { deleteFile, editingFilepath, currentSelectDir, renamingPathname } =
    useFileStore((state) => ({
      editingFilepath: state.filepath,
      currentSelectDir: state.currentSelectDir,
      deleteFile: state.deleteFile,
      renamingPathname: state.renamingPathname,
    }));
  const basename = path.basename(filepath);

  const handleRenameConfirm = async (value) => {
    const dirname = path.dirname(filepath);
    const destPath = path.join(dirname, value);
    await pify(fs.rename)(filepath, destPath);
    endRenaming();
    fileMoved({ fromPath: filepath, destPath });
  };
  const handleMouseOver = () => setHovered(true);

  const handleMouseLeave = () => setHovered(false);

  const [value, setValue] = useState(basename);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef.current]);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleBlur = () => {
    endRenaming();
  };
  const handleRename = () => {
    console.log(filepath, renamingPathname, "filepath");
    startRenaming({ pathname: filepath });
  };

  const handleKeyDown = (ev) => {
    if (ev.key === "Escape") {
      endRenaming();
    } else if (ev.key === "Enter") {
      if (!value || value == "") {
        endRenaming();
        return;
      }
      handleRenameConfirm(value);
    }
  };

  if (renamingPathname === filepath) {
    return (
      <Box
        className="inline-block flex"
        sx={{
          display: "flex",
          alignItems: "center",
          paddingLeft: `${depth * 8 + 24}px`,
        }}
      >
        <ListItemIcon
          style={{
            minWidth: "unset",
          }}
        >
          <FileIcon />
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
          }}
        />
      </Box>
    );
  }
  return (
    <div id="file" className="block p-[0px] w-full h-full">
      <Draggable
        pathname={filepath}
        type="file"
        onDrop={async (result) => {
          if (result) {
            fileMoved(result);
          }
        }}
        onDropByOther={() => {
          // Do nothing yet
        }}
      >
        <Container
          selected={editingFilepath === filepath && currentSelectDir == ""}
        >
          <div
            onClick={() => {
              loadFile({ filepath });
              if (isMobile) {
                pushScene({ nextScene: "edit" });
              }
            }}
            className="flex items-center cursor-pointer" // Tailwind classes for styling
            style={{
              padding: "0px",
              paddingLeft: `${depth * 8 + 24}px`,
            }}
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}
          >
            <ListItemIcon
              style={{
                minWidth: "unset",
              }}
            >
              <FileIcon />
            </ListItemIcon>
            <Pathname ignoreGit={ignoreGit}>{basename}</Pathname>
            {hovered && (
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
              />
            )}
          </div>
        </Container>
      </Draggable>
    </div>
  );
};

// const FileContextMenu = ({
//   root,
//   addToStage,
//   deleteFile,
//   startRenaming,
//   // include other props as necessary
// }) => {

//   const handleDelete = (event) => {
//     deleteFile({ filename: event.currentTarget.dataset.filepath });
//   };

//   const handleAddToStage = (event) => {
//     const relpath = path.relative(root, event.currentTarget.dataset.filepath);
//     addToStage({ projectRoot: root, relpath });
//   };

//   return (
//     <ContextMenu id="file">
//       <ContextMenuItem onClick={handleRename}>Rename</ContextMenuItem>
//       <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
//       <ContextMenuItem onClick={handleAddToStage}>Add to stage</ContextMenuItem>
//     </ContextMenu>
//   );
// };

export default FileLine;
