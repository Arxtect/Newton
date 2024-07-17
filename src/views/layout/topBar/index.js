
import React from "react";
import download from "@/assets/download.svg";
import down from "@/assets/down.svg";
import review from "@/assets/review.svg";
import history from "@/assets/history.svg";
import publish from "@/assets/publish.svg";
import share from "@/assets/share.svg";
import ellipsis from "@/assets/ellipsis.svg";
import left from "@/assets/left.svg";
import logoIcon from "@/assets/logo-icon.svg"

const maxDisplayCount = 3; // 最大显示的名字数量

const TopBar = (props) => {
  //   const getRandomColor = () => {
  //     const letters = "0123456789ABCDEF";
  //     let color = "#";
  //     for (let i = 0; i < 6; i++) {
  //       color += letters[Math.floor(Math.random() * 16)];
  //     }
  //     return color;
  //   };
  function getRandomColor(i) {
    const colors = ["#4caf4f", "#adaf4c", "#1bbcfe", "#9c5fd9", "#ff9a9e"];
    return colors[i ?? colors.length - 1];
  }
  const collaborators = ["AA", "cc", "aa", "ss", "aa", "a"];

  const handleClick = (type) => {
    console.log("handleClick", type);
  }

  const buttonData = [
    { src: review, label: "Review", click: handleClick },
    { src: history, label: "History", click: handleClick },
    { src: publish, label: "Publish", click: handleClick },
    { src: share, label: "Share", click: handleClick },
    { src: download, label: "", click: handleClick },
    { src: down, label: "", click: handleClick },
  ];

  return (
    <div className="flex items-center justify-between bg-gray-100 p-2">
      <div className="flex items-center pl-4">
        <img
          src={left}
          alt=""
          onClick={() => { }}
          className="cursor-pointer hover:opacity-75"
        />        <img
          src={logoIcon}
          alt="icon"
          className="mx-2"
        />
        <span className="ml-2 text-black font-bold">Project</span>
      </div>
      <div className="flex items-center space-x-10 mr-4">
        <div className="flex items-center bg-white rounded-lg shadow">
          {buttonData.map((button, index) => (
            <button
              key={index}
              className={`flex items-center text-gray-700 px-2 py-1 hover:bg-gray-200 active:bg-[#9fd5a2] space-x-1 ${index === 0 ? "rounded-l-lg" : ""}`}
              onClick={button.click}
            >
              <img src={button.src} alt="" className="w-4 h-4" />
              <span>{button.label || "\u00A0"}</span> {/* 使用空格字符 */}
            </button>
          ))}
        </div>
        <div className="flex items-center">
          {collaborators.slice(0, maxDisplayCount).map((name, index) => (
            <div
              key={index}
              className="relative rounded-full w-8 h-8 flex items-center justify-center border-2 border-white"
              style={{
                backgroundColor: getRandomColor(index),
                marginLeft: index === 0 ? "0" : "-0.5rem", // Adjust the overlap
                zIndex: 100 - index,
              }}
              title={name}
            >
              <span className="text-white text-xs">
                {name.charAt(0).toUpperCase()}
              </span>
            </div>
          ))}
          {collaborators.length > maxDisplayCount && (
            <div
              className="rounded-full w-8 h-8 flex items-center justify-center border-2 border-white"
              style={{
                backgroundColor: getRandomColor(),
                marginLeft: "-0.5rem", // Adjust the overlap
              }}
            >
              <img src={ellipsis} alt="" />
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
export default TopBar;
