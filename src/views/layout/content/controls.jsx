/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-11 13:44:14
 */
import React, { useState, forwardRef, useImperativeHandle } from "react";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import IconButton from "@mui/material/IconButton";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatUnderlinedIcon from "@mui/icons-material/FormatUnderlined";
import Grid from "@mui/material/Grid";
import TuneIcon from "@mui/icons-material/Tune";
import StopIcon from "@mui/icons-material/Stop";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import GridViewIcon from "@mui/icons-material/GridView";
import SearchIcon from "@mui/icons-material/Search";
import BorderColorTwoToneIcon from "@mui/icons-material/BorderColorTwoTone";
import WebAssetIcon from "@mui/icons-material/WebAsset";
import { Box, Tooltip } from "@mui/material";
import { useLayout } from "store";
import layoutSvg from "@/assets/layout/layout.svg";

const WebAssetIconRotate = (props) => {
  return (
    <WebAssetIcon
      sx={{
        transform: "rotate(-90deg)", // This rotates the whole icon
      }}
      {...props}
    />
  );
};

const CustomDropdownMenu = forwardRef((props, ref) => {
  const {
    showView,
    showXterm,
    showSide,
    showEditor,
    presentation,
    showHeader,

    toggleSide,
    toggleXterm,
    toggleEditor,
    toggleView,
    emitResize,
    showFooter,
  } = useLayout();

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  useImperativeHandle(ref, () => ({
    handleClick,
  }));

  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const actionList = [
    {
      icon: <WebAssetIconRotate />,
      isSelected: showSide,
      onClick: toggleSide,
      title: "sidebar",
    },
    {
      icon: <BorderColorTwoToneIcon />,
      isSelected: showEditor,
      onClick: toggleEditor,
      title: "editor",
    },
    {
      icon: <VisibilityIcon />,
      isSelected: showView,
      onClick: toggleView,
      title: "preview",
    },
    { icon: <ViewColumnIcon />, isSelected: false },
    { icon: <HelpOutlineIcon />, isSelected: false },
    { icon: <TextFieldsIcon />, isSelected: false },
    { icon: <GridViewIcon />, isSelected: false },
    { icon: <SearchIcon />, isSelected: false },
  ];

  return (
    <React.Fragment>
      <IconButton
        color="#inherit"
        aria-label="controls"
        size="small"
        onClick={handleClick}
      >
        {/* <TuneIcon fontSize="small" className="text-[#000]" />
         */}
        <img
          src={layoutSvg}
          alt=""
          className="w-5 h-5 cursor-pointer hover:opacity-75"
        />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        sx={{
          ".MuiPaper-root": {
            bgcolor: "#f1f1f2",
            width: "200px",
          },
        }}
      >
        <Grid container className="p-1 py-2" spacing={1}>
          {actionList.map((item, index) => (
            <Grid item xs={3} key={index}>
              <Tooltip title={item.title} key={index}>
                <IconButton
                  className={`p-2`}
                  onClick={() => {
                    item.onClick && item.onClick();
                  }}
                  sx={{
                    borderRadius: "20%",
                    ...(item.isSelected && {
                      bgcolor: "#cfcfd2",
                      "&:hover": {
                        bgcolor: "#cfcfd2", // 选中状态下悬停颜色不变
                      },
                    }),
                  }}
                >
                  {React.cloneElement(item.icon, { className: "text-[#000]" })}
                </IconButton>
              </Tooltip>
            </Grid>
          ))}
        </Grid>
      </Popover>
    </React.Fragment>
  );
});

export default CustomDropdownMenu;
