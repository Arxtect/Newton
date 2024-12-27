/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-07-30 15:02:25
 */
import React, { useRef, useState, useEffect } from "react";
import ArIcon from "@/components/arIcon";

import ArMenuRadix from "@/components/arMenuRadix";
//slide
import NewProject from "./newProject";
import UploadProject from "./uploadProject";
import Github from "./github";

const menuItems = [
  { key: "new", label: "New Project", icon: "NewProject" },
  { key: "all", label: "All Projects", icon: "AllProject" },
  {
    key: "your",
    label: "Your Projects",
    icon: "YourProject",
  },
  {
    key: "shared",
    label: "Shared With You",
    icon: "ShareProject",
  },
  { key: "trash", label: "Trash", icon: "Trash" },
  { key: "git", label: "Git Cloud", icon: "GitCloud" },
  // { key: "category", label: "Project Category", icon: "Category" },
];

const subCategories = [
  // { key: "sub_category_1", label: "Sub Category 1" },
  // { key: "sub_category_2", label: "Sub Category 2" },
];

const Slide = ({
  currentSelectMenu,
  setCurrentSelectMenu,
  getProjectList,
  user,
}) => {
  const handleClick = (key) => {
    setCurrentSelectMenu(key);
  };

  const getButtonClass = (open) => {
    console.log(open, "open");
    if (open) {
      return "bg-[#81c784]";
    }
  };
  //new project
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  //github
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);
  const [projectName, setProjectName] = useState("");

  const handleGithub = (open, proejctName) => {
    setGithubDialogOpen(open);
    setProjectName(proejctName);
  };

  return (
    <div className="flex flex-col grow px-2 w-full text-base font-semibold leading-4 text-center text-black border-0 border-black border-solid shadow-sm bg-zinc-200 pt-4">
      {menuItems.map((item) => {
        if (item.key === "new") {
          return (
            <ArMenuRadix
              key={item.key}
              align="left"
              title={"New Project"}
              getButtonClass={getButtonClass}
              buttonCom={
                <div
                  key={item.key}
                  className={`flex gap-5 px-5 py-3 rounded-2xl h-14 text-[1rem] items-center $ cursor-pointer`}
                >
                  <ArIcon name={item.icon} className="w-6" />
                  <div>{item.label}</div>
                </div>
              }
              items={[
                {
                  label: "New Project",
                  onSelect: () => setNewDialogOpen(true),
                },
                {
                  label: "Upload Project",
                  onSelect: () => setUploadDialogOpen(true),
                },
                {
                  label: "Import From Cloud",
                  onSelect: () => setGithubDialogOpen(true),
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
            <ArIcon name={item.icon} className="w-6" />
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
      <NewProject dialogOpen={newDialogOpen} setDialogOpen={setNewDialogOpen} />
      <UploadProject
        dialogOpen={uploadDialogOpen}
        setDialogOpen={setUploadDialogOpen}
        user={user}
      />
      <Github
        dialogOpen={githubDialogOpen}
        setDialogOpen={setGithubDialogOpen}
        getProjectList={getProjectList}
        user={user}
        projectName={projectName}
        setProjectName={setProjectName}
        currentSelectMenu={currentSelectMenu}
      ></Github>
    </div>
  );
};

export default React.memo(Slide);
