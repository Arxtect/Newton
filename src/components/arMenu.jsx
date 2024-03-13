import React, { useState } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import Divider from "@mui/material/Divider";

const ArMenu = ({ buttonLabel, menuList, templateItems, className, buttonCom, menuProps, widthExtend = true, buttonProps }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const renderButton = buttonCom
    ? React.cloneElement(buttonCom, { onClick: handleClick })
    : (
      <Button
        variant="contained"
        color="success"
        size="small"
        className={`w-full ${className}`}
        onClick={handleClick}
        {...buttonProps}
      >
        {buttonLabel}
      </Button>
    );
  return (
    <React.Fragment>
      {renderButton}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        PaperProps={{
          style: {
            width: anchorEl && widthExtend ? anchorEl.clientWidth : undefined,
          },
        }}
        {...menuProps}
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
