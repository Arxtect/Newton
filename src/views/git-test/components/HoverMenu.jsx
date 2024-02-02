/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-30 20:24:29
 */
import React, { useState } from "react";
import AddBoxIcon from "@mui/icons-material/AddBox"; // For creating files
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder"; // For creating directories
import DeleteIcon from "@mui/icons-material/Delete"; // For deleting
import EditIcon from "@mui/icons-material/Edit"; // For renaming
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

const HoverMenu = ({
  basename,
  dirpath,
  root,
  onAddFile,
  onAddFolder,
  onDelete,
  onRename,
  depth,
}) => {
  return (
    <div className="relative ml-auto group">
      <div className="absolute inset-0 flex items-center justify-end space-x-1 ">
        {onAddFile && (
          <Tooltip title="add file">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onAddFile(e);
              }}
            >
              <AddBoxIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        )}
        {onAddFolder && (
          <Tooltip title="add folder">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onAddFolder(e);
              }}
            >
              <CreateNewFolderIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        )}
        {/* basename !== ".git" && dirpath !== root && */}
        {onDelete && depth != 0 && (
          <Tooltip title="delete">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(e);
              }}
            >
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        )}
        {onRename && (
          <Tooltip title="rename">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onRename(e);
              }}
            >
              <EditIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default HoverMenu;
