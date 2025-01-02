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

const DirectoryLineWrapper = ({
  handleClick,
  dirpath,
  opened,
  children,
  title,
}) => {
  return (
    <div class="flex cursor-pointer items-center gap-1 p-1 w-full whitespace-nowrap rounded-sm text-sm leading-5 select-none">
      <ListItemIcon
        style={{
          minWidth: "unset",
        }}
        onClick={(e) => handleClick(e, dirpath)}
      >
        {opened ? <ExpandMoreIcon /> : <ChevronRightIcon />}
      </ListItemIcon>
      <ListItemIcon
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
        className=" flex"
        style={{
          width: "calc(100% - 80px)",
        }}
      >
        <span
          className={"flex-shrink flex-grow py-[1px]  whitespace-nowrap overflow-hidden"}
          title={title}
        >
          {children}
        </span>
      </div>
    </div>
  );
};

export default DirectoryLineWrapper;
