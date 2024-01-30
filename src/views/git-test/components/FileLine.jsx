import React from "react";
import { Icon, Menu, MenuItem } from "@mui/material";
import fs from "fs";
import path from "path";
import pify from "pify";
import Draggable from "./Draggable"; // Adjust the import path as needed
import Input from "./Input"; // Adjust the import path as needed
import Pathname from "./Pathname"; // Adjust the import path as needed
import FileIcon from "@mui/icons-material/InsertDriveFile"; // Assuming you have a FileIcon component

import ContextMenu from "@mui/material/Menu";
import ContextMenuItem from "@mui/material/MenuItem";
import ContextMenuTrigger from "@mui/material/IconButton";
import useFileStore from "../../../domain/filesystem/fileReduces/fileActions";

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
  renamingPathname,
  isMobile,
  loadFile,
  fileMoved,
  endRenaming,
  pushScene,
  ignoreGit, // Assuming this is also a prop that needs to be passed down
}) => {
  const { editingFilepath, currentSelectDir } = useFileStore((state) => ({
    editingFilepath: state.filepath,
    currentSelectDir: state.currentSelectDir,
  }));
  const basename = path.basename(filepath);

  const handleRenameConfirm = async (value) => {
    const dirname = path.dirname(filepath);
    const destPath = path.join(dirname, value);
    await pify(fs.rename)(filepath, destPath);
    endRenaming();
    fileMoved({ fromPath: filepath, destPath });
  };

  if (renamingPathname === filepath) {
    return (
      <div>
        <Input
          focus
          initialValue={basename}
          onCancel={() => endRenaming()}
          onConfirm={handleRenameConfirm}
        />
      </div>
    );
  }
  return (
    <ContextMenuTrigger id="file" className="block p-[0px] w-full h-full mt-2">
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
              paddingLeft: `${depth * 15}px`,
            }}
          >
            <FileIcon />
            <Pathname ignoreGit={ignoreGit}>{basename}</Pathname>
          </div>
        </Container>
      </Draggable>
    </ContextMenuTrigger>
  );
};

const FileContextMenu = ({
  root,
  addToStage,
  deleteFile,
  startRenaming,
  // include other props as necessary
}) => {
  const handleRename = (event) => {
    startRenaming({ pathname: event.currentTarget.dataset.filepath });
  };

  const handleDelete = (event) => {
    deleteFile({ filename: event.currentTarget.dataset.filepath });
  };

  const handleAddToStage = (event) => {
    const relpath = path.relative(root, event.currentTarget.dataset.filepath);
    addToStage({ projectRoot: root, relpath });
  };

  return (
    <ContextMenu id="file">
      <ContextMenuItem onClick={handleRename}>Rename</ContextMenuItem>
      <ContextMenuItem onClick={handleDelete}>Delete</ContextMenuItem>
      <ContextMenuItem onClick={handleAddToStage}>Add to stage</ContextMenuItem>
    </ContextMenu>
  );
};

export default FileLine;
