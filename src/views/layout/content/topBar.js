/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-07-18 10:06:45
 */
import React from "react";
import pickUpSvg from "@/assets/layout/pickup.svg";
import newFileSvg from "@/assets/layout/newFile.svg";
import newFolderSvg from "@/assets/layout/newFolder.svg";
import layoutSvg from "@/assets/layout/layout.svg";
import previewSvg from "@/assets/layout/preview.svg";
import redoSvg from "@/assets/layout/redo.svg";
import searchSvg from "@/assets/layout/search.svg";
import undoSvg from "@/assets/layout/undo.svg";
import uploadFileSvg from "@/assets/layout/uploadFile.svg";
import successSvg from "@/assets/layout/success.svg";
import { Select, MenuItem } from "@mui/material";

const ContentTopBar = (props) => {
  const widthOption = [
    {
      value: "100%",
      name: "100%",
    },
    {
      value: "75%",
      name: "75%",
    },
    {
      value: "50%",
      name: "50%",
    },
    {
      value: "25%",
      name: "25%",
    },
  ];

  return (
    <div className="flex items-center justify-between bg-[#e8f9ef] w-full">
      <div className="flex items-center pl-4 space-x-4 w-1/2">
        <img
          src={pickUpSvg}
          alt=""
          className="w-5 h-5 cursor-pointer hover:opacity-75"
        />
        <img
          src={newFileSvg}
          alt=""
          className="w-5 h-5 cursor-pointer hover:opacity-75"
        />
        <img
          src={newFolderSvg}
          alt=""
          className="w-5 h-5 cursor-pointer hover:opacity-75"
        />
        <img
          src={uploadFileSvg}
          alt=""
          className="w-5 h-5 cursor-pointer hover:opacity-75"
        />
        <img
          src={redoSvg}
          alt=""
          className="w-5 h-5 cursor-pointer hover:opacity-75"
        />
        <img
          src={undoSvg}
          alt=""
          className="w-5 h-5 cursor-pointer hover:opacity-75"
        />
        <img
          src={searchSvg}
          alt=""
          className="w-5 h-5 cursor-pointer hover:opacity-75"
        />
      </div>
      <div className="flex items-center  justify-between space-x-10 mr-4 w-1/2 pl-2">
        <button className="bg-[#81c784] text-black px-2 py-0.5 rounded-md flex items-center space-x-2 h-6">
          <span>Compile</span>
          <img src={successSvg} alt="" className="w-4 h-4" />
        </button>
        <div className="flex items-center space-x-4">
          <Select
            labelId="tag-label"
            id="demo-simple-select"
            variant="outlined"
            value="100%"
            sx={{
              height: "24px",
              minWidth: "70px",
              padding: "0",
              textAlign: "center",
            }}
            MenuProps={{
              PaperProps: {
                style: {
                  textAlign: "center",
                },
              },
            }}
          >
            {widthOption.map((option) => (
              <MenuItem
                key={option.name}
                value={option.name}
                sx={{ padding: "2px 10px" }}
              >
                {option.name}
              </MenuItem>
            ))}
          </Select>
          <img
            src={previewSvg}
            alt=""
            className="w-5 h-5 cursor-pointer hover:opacity-75"
          />
          <img
            src={layoutSvg}
            alt=""
            className="w-5 h-5 cursor-pointer hover:opacity-75"
          />
        </div>
      </div>
    </div>
  );
};

export default ContentTopBar;
