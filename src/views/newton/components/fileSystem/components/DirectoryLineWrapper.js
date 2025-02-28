/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-26 10:17:19
 */
import React from "react";
import ArIcon from "@/components/arIcon";
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { List, ListItem, ListItemText, ListItemIcon } from "@mui/material";
import HoverMenu from "./HoverMenu";

const DirectoryLineWrapper = ({
  handleClick,
  dirpath,
  opened,
  children,
  title,
  basename,
  onAddFile,
  onAddFolder,
  handleDeleteDirectory,
  handleRename,
  depth,
  menuItems,
  hovered,
}) => {
  return (
    <div class="flex cursor-pointer items-center  w-full whitespace-nowrap  select-none ">
      <ListItemIcon
        style={{
          minWidth: "unset",
        }}
        onClick={(e) => handleClick(e, dirpath)}
        className="mt-[-0.2rem]"
      >
        {opened ? <ExpandMoreIcon /> : <ChevronRightIcon />}
      </ListItemIcon>
      <ListItemIcon
        className="mt-[-0.2rem]"
        style={{ minWidth: "unset" }}
        onClick={(e) => handleClick(e, dirpath)}
      >
        {opened ? (
          <ArIcon name={"FolderOpen"} className="text-black w-[1.5rem]" />
        ) : (
          <ArIcon name={"FolderClose"} className="text-black w-[1.5rem]" />
        )}
      </ListItemIcon>
      <div
        className="flex pl-1 whitespace-nowrap overflow-hidden"
        style={{
          width: "100%",
        }}
        title={title}
        onClick={(e) => handleClick(e, dirpath)}
      >
        {children}
      </div>
      <HoverMenu
        menuItems={menuItems}
        hovered={hovered}
        className="mt-[-0.2rem]"
      />
    </div>
  );
};

export default DirectoryLineWrapper;
