/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-11 13:44:14
 */
import React, {
  useState,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from "react";
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
import ArMenuRadix from "@/components/arMenuRadix";
import editorPdfSvg from "@/assets/layout/editorPdf.svg";
import onlyPdfSvg from "@/assets/layout/onlyPdf.svg";
import onlyCodeSvg from "@/assets/layout/onlyCode.svg";

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
    changeShowView,
    changeShowEditor,
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

  //   const getButtonClass = (open) => {
  //   console.log(open, "open");
  //   if (open) {
  //     return "bg-[#81c784]";
  //   }
  // };

  return (
    <div className="font-bold leading-3 text-center text-[0.9rem] text-black border-0 border-black border-solid ">
      <ArMenuRadix
              align="left"
              title={"New Project"}
              // getButtonClass={getButtonClass}
              buttonCom={
                   <Tooltip title={"Layout"}>
        <IconButton
          color="#inherit"
          aria-label="controls"
          size="small"
          onClick={handleClick}
        >
          <img
            src={layoutSvg}
            alt=""
            className="w-5 h-5 cursor-pointer hover:opacity-75"
          />
        </IconButton>
      </Tooltip>
              }
              items={[
                {
                  label: "Editor & PDF",
                  icon:editorPdfSvg,
                      onSelect: () => {
                         changeShowEditor(true)
    changeShowView(true)
                      },
                },
                {
                  label: "Editor Only",  icon:onlyCodeSvg,
                  onSelect: () => {
                     changeShowEditor(true)
    changeShowView(false)
                  },
                },
                {
                  label: "PDF Only",  icon:onlyPdfSvg,
                  onSelect: () => {
                      changeShowEditor(false)
    changeShowView(true)
                  },
                },
              ]}
            ></ArMenuRadix>
    </div>
  );
});

export default CustomDropdownMenu;
