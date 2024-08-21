import React, { useEffect } from "react";
import download from "@/assets/download.svg";
import down from "@/assets/down.svg";
import review from "@/assets/review.svg";
import history from "@/assets/history.svg";
import ellipsis from "@/assets/ellipsis.svg";
import left from "@/assets/left.svg";
import logoIcon from "@/assets/logo-icon.svg";
import Share from "../share";
import LinkGithub from "../linkGithub";
import PublishDocument from "../publishDocument";
import { useUserStore, useFileStore } from "@/store";
import { downloadDirectoryAsZip } from "domain/filesystem";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";
import {getColors} from "@/util";
const maxDisplayCount = 3; // 最大显示的名字数量

const TopBar = (props) => {
  const { user } = useUserStore((state) => ({
    user: state.user,
  }));
  const navigate = useNavigate();
  const {shareUserList, projectSync, sourceCode, currentProjectRoot, filepath, loadFile } =
    useFileStore((state) => ({
      shareUserList:state.shareUserList,
      projectSync: state.projectSync,
      sourceCode: state.value,
      currentProjectRoot: state.currentProjectRoot,
      filepath: state.filepath,
      loadFile: state.loadFile,
    }));


  const handleClick = (type) => {
    switch (type) {
      case "Review":
        break;
      case "History":
        break;
      case "Download":
        downloadDirectoryAsZip(currentProjectRoot);
        break;
      case "Down":
        break;
      default:
        break;
    }
    console.log("handleClick", type);
  };

  const buttonData = [
    // { key: "Review", src: review, label: "Review", click: handleClick },
    { key: "Sync", src: "", label: "Sync", click: handleClick },
    // { key: "History", src: history, label: "History", click: handleClick },
    { key: "Publish", src: "", label: "Publish", click: handleClick },
    { key: "Share", src: "", label: "Share", click: handleClick },
    { key: "Download", src: download, label: "", click: handleClick },
    // { key: "More", src: down, label: "", click: handleClick },
  ];

  useEffect(() => {
    console.log(shareUserList, "projectSync");
  }, [shareUserList]);

  return (
    <div className="flex items-center justify-between p-2 bg-[#f9fdfd]">
      <div className="flex items-center pl-4 space-x-4">
        <img
          src={left}
          alt=""
          onClick={() => {
            navigate("/project");
          }}
          className="cursor-pointer hover:opacity-50"
        />
        <img src={logoIcon} alt="icon" className="mx-2" />
        <span className="ml-2 text-black font-bold">Project</span>
      </div>
      <div className="flex items-center space-x-20 mr-4">
        {!!projectSync && (
          <div className="flex items-center">
            {shareUserList.slice(0, maxDisplayCount).map((user, index) => (
              <div
                key={user.id}
                className="relative rounded-full w-8 h-8 flex items-center justify-center border-2 border-white"
                style={{
                  backgroundColor: user?.color||getColors(index),
                  marginLeft: index === 0 ? "0" : "-0.5rem", // Adjust the overlap
                  zIndex: 100 - index,
                }}
                title={user.name}
              >
                <span className="text-white text-xs">
                  {user.name?.charAt(0)?.toUpperCase()}
                </span>
              </div>
            ))}
            {shareUserList?.length > maxDisplayCount && (
              <div
                className="rounded-full w-8 h-8 flex items-center justify-center border-2 border-white"
                style={{
                  backgroundColor: getColors(12),
                  marginLeft: "-0.5rem", // Adjust the overlap
                }}
              >
                <img src={ellipsis} alt="" />
              </div>
            )}
          </div>
        )}
        <div className="flex items-center bg-white rounded-lg shadow">
          {buttonData.map((button, index) => {
            if (button.key === "Share") {
              return <Share rootPath={currentProjectRoot} user={user}></Share>;
            }
            if (button.key === "Publish") {
              return <PublishDocument></PublishDocument>;
            }
            if (button.key === "Sync") {
              return <LinkGithub></LinkGithub>;
            }
            return (
              <Tooltip title={button.key}>
                <button
                  key={index}
                  className={`flex items-center text-gray-700 px-2 py-1 hover:bg-gray-200 active:bg-[#9fd5a2] ${
                    index === 0 ? "rounded-l-lg" : ""
                  } ${button.label ? "space-x-1" : ""}`}
                  onClick={() => {
                    button.click(button.key);
                  }}
                >
                  {!button.label && <span>{"\u00A0"}</span>}
                  <img src={button.src} alt="" className="w-4 h-4" />
                  <span>{button.label || "\u00A0"}</span> {/* 使用空格字符 */}
                </button>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default TopBar;
