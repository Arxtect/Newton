/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-07-17 18:01:20
 */
import React from "react";
import download from "@/assets/download.svg";
import down from "@/assets/down.svg";

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

  return (
    <div className="flex items-center justify-between bg-gray-100 p-2">
      <div className="flex items-center">
        <i className="fas fa-arrow-left text-gray-500"></i>
        <img
          src="https://placehold.co/20x20"
          alt="File icon"
          className="ml-2"
        />
        <span className="ml-2 text-gray-700">File Name</span>
      </div>
      <div className="flex items-center space-x-10">
        <div className="flex items-center bg-white  rounded-lg shadow">
          <button className="bg-green-500 text-white px-2 py-1 rounded-l-lg">
            Review
          </button>
          <button className="flex items-center text-gray-700 px-2 py-1 hover:bg-gray-200 active:bg-[#9fd5a2]">
            History
          </button>
          <button className="flex items-center text-gray-700 px-2 py-1 hover:bg-gray-200 active:bg-[#9fd5a2]">
            Publish
          </button>
          <button className="flex items-center text-gray-700 px-2 py-1 hover:bg-gray-200 active:bg-[#9fd5a2]">
            Share
          </button>
          <button className="flex items-center text-gray-700 px-2 py-1 hover:bg-gray-200 active:bg-[#9fd5a2]">
            <img src={download} alt="" />
          </button>
          <button className="flex items-center text-gray-700 px-2 py-1 hover:bg-gray-200 active:bg-[#9fd5a2]">
            <img src={down} alt="" />
          </button>
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
              <span className="text-white text-md">...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default TopBar;
