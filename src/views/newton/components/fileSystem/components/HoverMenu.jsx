/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-30 20:24:29
 */
import React, { useState, useEffect } from "react";
import AddBoxIcon from "@mui/icons-material/AddBox"; // For creating files
import CreateNewFolderIcon from "@mui/icons-material/CreateNewFolder"; // For creating directories
import DeleteIcon from "@mui/icons-material/Delete"; // For deleting
import EditIcon from "@mui/icons-material/Edit"; // For renaming
import IconButton from "@mui/material/IconButton";
import Tooltip from "@/components/tooltip";
import ClickContextMenu from "@/components/contextMenu/ClickContextMenu";
import ArIcon from "@/components/arIcon";

const HoverMenu = ({
  menuItems,
  hovered,
  className,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const onOpenChange = (open) => {
    setMenuVisible(open);
  };

  useEffect(() => {
    return () => {
      setMenuVisible(false);
    };
  }, []);

  return (
    <Tooltip content="Menu" position="bottom" isHasChildren={true}>
      <div
        className={`relative ml-auto group mr-2 ${className}`}
        id="hover-menu"
      >
        {/* <div className="absolute inset-0 flex items-center justify-end space-x-1"> */}
        <ClickContextMenu items={menuItems} onOpenChange={onOpenChange}>
          {(hovered || menuVisible) && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <ArIcon
                name="Menu"
                className="text-black h-full w-4 cursor-pointer"
              />
            </IconButton>
          )}
        </ClickContextMenu>
      </div>
    </Tooltip>
  );
};

export default HoverMenu;
