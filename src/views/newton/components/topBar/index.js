import React, { useState, useEffect, useRef } from "react";
import ellipsis from "@/assets/ellipsis.svg";
import logoIcon from "@/assets/logo-icon.svg";
import Share from "../dialog/share";
import LinkGithub from "../dialog/linkGithub";
import PublishDocument from "../dialog/publishDocument";
import historyIcon from "@/assets/history.svg";
import ViewHistory from "../viewHistory";
import { useUserStore, useFileStore } from "@/store";
import { downloadDirectoryAsZip, getProjectInfo } from "domain/filesystem";
import { useNavigate } from "react-router-dom";
import { TextField } from "@mui/material";

import ArIcon from "@/components/arIcon";

import { getColors, getFirstNUpperCaseChars } from "@/utils";
import Tooltip from "@/components/tooltip";
import fs from "fs";
import path from "path";
import pify from "pify";
import { toast } from "react-toastify";

const maxDisplayCount = 3; // 最大显示的名字数量

const RenameTextInput = ({
  value,
  handleChange,
  handleBlur,
  handleKeyDown,
  inputRef,
}) => (
  <TextField
    className="tailwind-classes-for-input"
    variant="outlined"
    size="small"
    value={value}
    onChange={handleChange}
    onBlur={handleBlur}
    onKeyDown={handleKeyDown}
    inputRef={inputRef}
    sx={{
      width: "100%",
      "& .MuiInputBase-input": {
        padding: "0 6px",
        width: "100%",

        textAlign: "center",
      },
      "& .MuiOutlinedInput-root": {
        "& fieldset": {
          borderColor: "#81C784",
        },
        "&:hover fieldset": {
          borderColor: "#81C784",
        },
        "&.Mui-focused fieldset": {
          borderColor: "#81C784",
        },
      },
    }}
  />
);

const TopBar = (props) => {
  const { user } = useUserStore((state) => ({
    user: state.user,
  }));
  const navigate = useNavigate();
  const {
    shareUserList,
    projectSync,
    sourceCode,
    currentProjectRoot,
    filepath,
    changeCurrentProjectRoot,
    fileMoved,
    parentDir,
  } = useFileStore((state) => ({
    shareUserList: state.shareUserList,
    projectSync: state.projectSync,
    sourceCode: state.value,
    currentProjectRoot: state.currentProjectRoot,
    filepath: state.filepath,
    changeCurrentProjectRoot: state.changeCurrentProjectRoot,
    fileMoved: state.fileMoved,
    parentDir: state.parentDir,
  }));

  const handleClick = (type) => {
    switch (type) {
      case "Review":
        break;
      case "History":
        break;
      case "Download":
        downloadDirectoryAsZip(path.basename(currentProjectRoot), parentDir);
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
    { key: "History", src: historyIcon, label: "History", click: handleClick },
    { key: "Publish", src: "", label: "Publish", click: handleClick },
    { key: "Share", src: "", label: "Share", click: handleClick },
    { key: "Download", src: "Download", label: "", click: handleClick },
    // { key: "More", src: down, label: "", click: handleClick },
  ];

  // rename
  const [isEditing, setIsEditing] = useState(false);

  const [value, setValue] = useState(path.basename(currentProjectRoot));
  const inputRef = useRef(null);

  const handleChange = (event) => {
    console.log(event.target.value, "event.target.value");
    setValue(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    handleDirRenameConfirm(value);
  };

  useEffect(() => {
    setValue(path.basename(currentProjectRoot));
  }, [currentProjectRoot]);

  const handleDirRenameConfirm = async (value) => {
    if (!value || value == "") {
      return;
    }
    try {
      // Rename the directory

      const newProjectName = path.join(parentDir, value);
      await pify(fs.rename)(currentProjectRoot, newProjectName);

      setValue(path.basename(newProjectName));
      fileMoved({ fromPath: currentProjectRoot, destPath: newProjectName });
      changeCurrentProjectRoot({
        projectRoot: newProjectName,
        parentDir: parentDir,
      });
    } catch (error) {
      console.error("Error renaming directory:", error);
    }
  };
  const handleKeyDown = (ev) => {
    if (ev.key === "Escape") {
      setValue(path.basename(currentProjectRoot));
      setIsEditing(false);
    } else if (ev.key === "Enter") {
      handleDirRenameConfirm(value);
      setIsEditing(false);
    }
  };

  const handleEditClick = async () => {
    const projectInfo = await getProjectInfo(currentProjectRoot);
    if (!!projectInfo.isSync) {
      toast.warning(
        "This is a shared collaboration project. Renaming is prohibited"
      );
      return;
    }
    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        renameSection(currentProjectRoot);
      }
    }, 0);
  };

  const renameSection = (filepath) => {
    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(0, filepath.length);
    }, 0);
  };

  return (
    <div className="flex items-center justify-between p-2 bg-[#f9fdfd]">
      <div className="flex items-center pl-4 space-x-4 w-1/5">
        <ArIcon
          name="ReturnArrowLeft"
          onClick={() => {
            navigate("/project");
          }}
          className="cursor-pointer hover:opacity-50"
        />
        <img src={logoIcon} alt="icon" className="mx-2" />
        <span className="ml-2 text-black font-bold font-arx">Project</span>
      </div>
      <div
        className="h-full group flex justify-center items-center text-center w-2/5 text-[0.9rem]"
        onDoubleClick={handleEditClick}
      >
        <div className="flex items-center justify-center w-4/5 text-ellipsis whitespace-nowrap overflow-hidden relative">
          {isEditing ? (
            <RenameTextInput
              value={value}
              handleChange={handleChange}
              handleBlur={handleBlur}
              handleKeyDown={handleKeyDown}
              inputRef={inputRef}
            />
          ) : (
            <React.Fragment>
              <div
                className="h-full text-[1rem] text-center font-arx text-ellipsis overflow-hidden"
                title={path.basename(currentProjectRoot)}
              >
                {path.basename(currentProjectRoot)}
              </div>
              <ArIcon
                name="Edit"
                className="ml-2 w-4 h-4 opacity-0 group-hover:opacity-100 cursor-pointer"
                onClick={handleEditClick}
              />
            </React.Fragment>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-20 mr-4 w-2/5 justify-end">
        {!!projectSync && shareUserList?.length > 1 && (
          <div className="flex items-center">
            {shareUserList.slice(0, maxDisplayCount).map((user, index) => (
              <Tooltip content={user.name} position="bottom">
                <div
                  key={user.id}
                  className="relative rounded-full w-8 h-8 flex items-center justify-center border-2 border-white"
                  style={{
                    backgroundColor: user?.color || getColors(index),
                    marginLeft: index === 0 ? "0" : "-0.5rem", // Adjust the overlap
                    zIndex: 100 - index,
                  }}
                >
                  <span className="text-white text-xs">
                    {getFirstNUpperCaseChars(user.name)}
                  </span>
                </div>
              </Tooltip>
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
            if (button.key === "History") {
              return <ViewHistory></ViewHistory>;
            }
            return (
              <Tooltip content={button.key} position="bottom">
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
                  <ArIcon
                    name={button.src}
                    className="text-black w-[1.1rem] h-[1.1rem]"
                  />
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
