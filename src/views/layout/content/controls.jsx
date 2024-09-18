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
  useCallback,
} from "react";
import IconButton from "@mui/material/IconButton";
import { Box } from "@mui/material";
import { useLayout } from "store";
import layoutSvg from "@/assets/layout/layout.svg";
import ArMenuRadix from "@/components/arMenuRadix";
import editorPdfSvg from "@/assets/layout/editorPdf.svg";
import onlyPdfSvg from "@/assets/layout/onlyPdf.svg";
import onlyCodeSvg from "@/assets/layout/onlyCode.svg";
import Tooltip from "@/components/tooltip";

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

  const getButtonClass = (open) => {
    console.log(open, "open");
    if (open) {
      return "bg-[#81c784]";
    }
  };

  return (
    <div className="font-bold leading-3 text-center text-[0.9rem] text-black border-0 border-black border-solid ">
      <ArMenuRadix
        align="left"
        title={"New Project"}
        getButtonClass={(open) => getButtonClass(open)}
        buttonCom={
          <IconButton
            color="#inherit"
            aria-label="controls"
            size="small"
            onClick={handleClick}
          >
            <Tooltip content={"Layout"} position="bottom">
              <img
                src={layoutSvg}
                alt=""
                className="w-5 h-5 cursor-pointer hover:opacity-75"
              />
            </Tooltip>
          </IconButton>
        }
        items={[
          {
            label: "Editor & PDF",
            icon: editorPdfSvg,
            onSelect: () => {
              changeShowEditor(true);
              changeShowView(true);
            },
          },
          {
            label: "Editor Only",
            icon: onlyCodeSvg,
            onSelect: () => {
              changeShowEditor(true);
              changeShowView(false);
            },
          },
          {
            label: "PDF Only",
            icon: onlyPdfSvg,
            onSelect: () => {
              changeShowEditor(false);
              changeShowView(true);
            },
          },
        ]}
      ></ArMenuRadix>
    </div>
  );
});

export default React.memo(CustomDropdownMenu);
