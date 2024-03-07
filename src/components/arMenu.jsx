import React, { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import Divider from "@mui/material/Divider";

const ArMenu = ({ buttonLabel, menuList, templateItems, className }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Button
        variant="contained"
        color="success"
        size="small"
        className={`w-full ${className}`}
        onClick={handleClick}
      >
        {buttonLabel}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        PaperProps={{
          style: {
            width: anchorEl ? anchorEl.clientWidth : undefined, // Set the menu width to match the button
          },
        }}
      >
        {menuList.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              handleClose();
              item.onClick();
            }}
          >
            {item.label}
          </MenuItem>
        ))}
        {templateItems && templateItems?.items?.length > 0 && (
          <React.Fragment>
            <Divider />
            <ListSubheader className="text-[#afb5c0] text-[0.875rem] leading-[30px]">
              {templateItems.title}
            </ListSubheader>
            {templateItems.items.map((item, index) => (
              <MenuItem
                key={`template-${index}`}
                onClick={() => {
                  handleClose();
                  item.onClick();
                }}
              >
                {item.label}
              </MenuItem>
            ))}
          </React.Fragment>
        )}
      </Menu>
    </React.Fragment>
  );
};

export default ArMenu;
