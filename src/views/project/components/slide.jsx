/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-07-30 15:02:25
 */
import React, { useRef, useState, useEffect } from "react";
import allProjectSvg from "@/assets/project/allProject.svg";
import yourProjectSvg from "@/assets/project/yourProject.svg";
import shareProjectSvg from "@/assets/project/shareProject.svg";
import categorySvg from "@/assets/project/category.svg";
import newProjectSvg from "@/assets/project/newProject.svg";
import trashSvg from "@/assets/project/trash.svg";
import gitCloudSvg from "@/assets/project/gitCloud.svg";

import ArMenuRadix from "@/components/arMenuRadix";

const menuItems = [
  { key: "new", label: "New Project", icon: newProjectSvg },
  { key: "all", label: "All Projects", icon: allProjectSvg },
  {
    key: "your",
    label: "Your Projects",
    icon: yourProjectSvg,
  },
  {
    key: "shared",
    label: "Shared With You",
    icon: shareProjectSvg,
  },
  { key: "trash", label: "Trash", icon: trashSvg },
  { key: "git", label: "Git Cloud", icon: gitCloudSvg },
  { key: "category", label: "Project Category", icon: categorySvg },
];

const subCategories = [
  { key: "sub_category_1", label: "Sub Category 1" },
  { key: "sub_category_2", label: "Sub Category 2" },
];

const Slide = ({ contentRef,currentSelectMenu, setCurrentSelectMenu }) => {

  const handleClick = (key) => {
    setCurrentSelectMenu(key)
  };

  const getButtonClass = (open) => {
    console.log(open, "open");
    if (open) {
      return "bg-[#81c784]";
    }
  };

  return (
    <div className="flex flex-col grow px-2 w-full text-base font-semibold leading-4 text-center text-black border-0 border-black border-solid shadow-sm bg-zinc-200 pt-4">
      {menuItems.map((item) => {
        if (item.key === "new") {
          return (
            <ArMenuRadix
              align="left"
              title={"New Project"}
              getButtonClass={getButtonClass}
              buttonCom={
                <div
                  key={item.key}
                  className={`flex gap-5 px-5 py-3 rounded-2xl h-14 text-[1rem] items-center $ cursor-pointer`}
                >
                  <img src={item.icon} className="w-6" />
                  <div>{item.label}</div>
                </div>
              }
              items={[
                {
                  label: "New Project",
                  onSelect: () => contentRef.current.setNewDialogOpen(true),
                },
                {
                  label: "Upload Project",
                  onSelect: () => contentRef.current.setUploadDialogOpen(true),
                },
                {
                  label: "Import From Cloud",
                  onSelect: () => contentRef.current.setGithubDialogOpen(true),
                },
                // {
                //   label: "Templates",
                //   separator: true,
                //   subMenu: [
                //     {
                //       label: "Academic Journal",
                //       onSelect: () => console.log("Academic Journal"),
                //     },
                //     {
                //       label: "Book",
                //       onSelect: () => console.log("Book"),
                //     },
                //   ],
                // },
              ]}
            ></ArMenuRadix>
          );
        }
        return (
          <div
            key={item.key}
            className={`flex gap-5 px-5 py-3 rounded-2xl my-1 h-14 text-[1rem] items-center ${
              currentSelectMenu === item.key ? "bg-[#81c784]" : ""
            } cursor-pointer`}
            onClick={() => handleClick(item.key)}
          >
            <img src={item.icon} className="w-6" />
            <div>{item.label}</div>
          </div>
        );
      })}
      <div className="flex flex-col justify-start grow px-5 mt-2">
        <div className="flex flex-col ml-2">
          {subCategories.map((sub) => (
            <div
              key={sub.key}
              className="flex gap-5 justify-start mt-2 whitespace-nowrap my-4"
            >
              <div className="shrink-0 self-start bg-green-300 rounded-full h-[15px] w-[15px]" />
              <div className="my-auto">{sub.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Slide;
