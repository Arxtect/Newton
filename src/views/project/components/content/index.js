import React, { useMemo, useRef, useState, useEffect } from "react";
import Tooltip from "@/components/tooltip";
import ArIcon from "@/components/arIcon";
import ContentBar from "./top/contentBar";
import Grid from "./list/grid";
import Table from "./list/table";

const Content = ({
  currentSelectMenu,
  user,
  getProjectList,
  handleCopy,
  projectData,
  handleRename,
  setIsTrashDelete,
  setIsGitDelete,
  handleDeleteProject,
  auth,
  handleGithub,
  controlShare,
  changeCurrentProjectRoot,
  setGithubDialogOpen,
}) => {
  // search
  const [searchInput, setSearchInput] = useState("");
  const [selectedRows, setSelectedRows] = React.useState([]);

  //table top
  const [sortType, setSortType] = useState("table");
  const [sortSelect, setSortSelect] = useState("lastModified");

  useEffect(() => {
    if (sortType === "table") return;
    setSelectedRows([]);
  }, [sortType]);

  //table list
  const sortedRows = useMemo(() => {
    return [...projectData]
      .filter((data) =>
        data.title.toLowerCase().includes(searchInput.toLowerCase())
      )
      .sort((a, b) => {
        if (sortSelect === "lastModified") {
          return b.lastModified - a.lastModified;
        } else if (sortSelect === "lastCreated") {
          return b.created_at - a.created_at;
        } else if (sortSelect === "alphabetical") {
          return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
        }
        return 0;
      });
  }, [projectData, searchInput, sortSelect]);
  return (
    <>
      <div className="flex flex-col w-full">
        <ContentBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          selectedRows={selectedRows}
          auth={auth}
          user={user}
          getProjectList={getProjectList}
          handleCopy={handleCopy}
          handleRename={handleRename}
        ></ContentBar>
        <div className="flex justify-between gap-5 mt-5 w-full max-md:flex-wrap">
          <div className="flex justify-between items-center text-xl font-semibold  text-center text-black">
            Projects Dashboard
            {currentSelectMenu == "trash" && (
              <Tooltip
                content="Trash project are automatically deleted after 30 days"
                position={"top"}
              >
                <ArIcon
                  name={"Tip"}
                  className="w-[0.9rem] h-[0.9rem] ml-2 cursor-pointer text-arxTheme"
                />
              </Tooltip>
            )}
          </div>
          <div className="flex gap-3.5">
            <div className="grow my-auto text-base font-medium text-center text-black">
              Sort By
            </div>
            <div className="flex rounded bg-gray-200 overflow-hidden">
              <Tooltip content="Table" position={"bottom"}>
                <div
                  className={`flex items-center justify-center w-7 h-7 cursor-pointer ${
                    sortType === "table" ? "bg-arxTheme" : ""
                  }`}
                  onClick={() => setSortType("table")}
                >
                  <ArIcon name={"Table"} className="w-5 h-5" />
                </div>
              </Tooltip>
              <Tooltip content="Grid" position={"bottom"}>
                <div
                  className={`flex items-center justify-center w-7 h-7 cursor-pointer ${
                    sortType === "grid" ? "bg-arxTheme" : "bg-gray-200"
                  } ${
                    currentSelectMenu !== "git" && currentSelectMenu !== "trash"
                      ? ""
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  onClick={
                    currentSelectMenu !== "git" && currentSelectMenu !== "trash"
                      ? () => setSortType("grid")
                      : null
                  }
                >
                  <ArIcon name={"Grid"} className="w-5 h-5" />
                </div>
              </Tooltip>
            </div>
            <div className="relative inline-block text-gray-700">
              <select
                value={sortSelect}
                onChange={(event) => setSortSelect(event.target.value)}
                className="appearance-none bg-gray-200 border border-gray-300 text-gray-700 pl-1 pr-5 rounded focus:outline-none py-[0.05rem]"
              >
                <option value="lastModified">Last modified</option>
                <option value="lastCreated">Last created</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <ArIcon name={"Expand"} />
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 ">
          {sortType == "table" ? (
            <Table
              sortSelect={sortSelect}
              searchInput={searchInput}
              setSelectedRows={setSelectedRows}
              projectData={projectData}
              getProjectList={getProjectList}
              sortedRows={sortedRows}
              currentSelectMenu={currentSelectMenu}
              auth={auth}
              user={user}
              handleGithub={handleGithub}
              handleCopy={handleCopy}
              handleRename={handleRename}
              controlShare={controlShare}
              handleDeleteProject={handleDeleteProject}
              setIsGitDelete={setIsGitDelete}
              setIsTrashDelete={setIsTrashDelete}
            ></Table>
          ) : (
            <Grid
              sortSelect={sortSelect}
              searchInput={searchInput}
              setSelectedRows={setSelectedRows}
              projectData={projectData}
              getProjectList={getProjectList}
              sortedRows={sortedRows}
              auth={auth}
              user={user}
              setGithubDialogOpen={setGithubDialogOpen}
              changeCurrentProjectRoot={changeCurrentProjectRoot}
              handleGithub={handleGithub}
              handleCopy={handleCopy}
              handleRename={handleRename}
              controlShare={controlShare}
              handleDeleteProject={handleDeleteProject}
              setIsGitDelete={setIsGitDelete}
              setIsTrashDelete={setIsTrashDelete}
            ></Grid>
          )}
        </div>
      </div>
    </>
  );
};

export default React.memo(Content);
