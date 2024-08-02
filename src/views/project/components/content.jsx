import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useImperativeHandle,
} from "react";
import ContentBar from "./contentBar";
import Grid from "./grid";
import Table from "./table";
import tableSvg from "@/assets/project/table.svg";
import gridSvg from "@/assets/project/grid.svg";
import expandSvg from "@/assets/project/expand.svg";
import { Tooltip } from "@mui/material";
import {
  findAllProjectInfo,
  downloadDirectoryAsZip,
  getProjectInfo,
} from "domain/filesystem";
import { useUserStore, useLoginStore, useFileStore } from "@/store";
import NewProject from "../newProject";
import UploadProject from "../uploadProject";
import Github from "../github";
import { toast } from "react-toastify";

const Content = React.forwardRef((props, ref) => {
  const { changeCurrentProjectRoot } = useFileStore((state) => ({
    changeCurrentProjectRoot: state.changeCurrentProjectRoot,
  }));
  const { updateDialogLoginOpen, updateOtherOperation } = useLoginStore(
    (state) => ({
      updateDialogLoginOpen: state.updateDialogLoginOpen,
      updateOtherOperation: state.updateOtherOperation,
    })
  );

  const auth = (condition, callback) => {
    if (condition) {
      toast.warning("Nonanonymous project，Please login first");
      updateDialogLoginOpen(true);
      updateOtherOperation(callback);
      return true;
    }
    return false;
  };

  const [sortType, setSortType] = useState("table");
  const [sortSelect, setSortSelect] = useState("lastModified");
  // slider menu
  const [currentSelectMenu, setCurrentSelectMenu] = useState("all");
  // search
  const [searchInput, setSearchInput] = useState("");
  const [selectedRows, setSelectedRows] = React.useState([]);
  const { user } = useUserStore((state) => ({
    user: state.user,
  }));

  //new project
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  //github
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);

  const handleCurrentSelectMenu = (id) => {
    setCurrentSelectMenu(id);
  };

  useEffect(() => {
    if (sortType === "table") return;
    setSelectedRows([]);
  }, [sortType]);

  const [projectData, setProjectData] = useState([]);

  const getProjectList = async (currentSelectMenu) => {
    console.log(currentSelectMenu, "currentSelectMenu");
    const project = await findAllProjectInfo();

    console.log(project, "project");
    setProjectData(
      project
        .map((item, index) => {
          if (currentSelectMenu == "trash") {
            return null;
          }
          if (currentSelectMenu == "category") {
            return null;
          }
          if (currentSelectMenu == "git") {
            return null;
          }
          if (
            currentSelectMenu == "shared" &&
            (item?.userId == user?.id || !item?.isSync)
          ) {
            return null;
          }
          if (
            currentSelectMenu == "your" &&
            item?.userId &&
            item?.userId != user?.id
          ) {
            return null;
          }
          return {
            id: index + 1,
            ...item,
          };
        })
        .filter((item) => item !== null)
    );
  };
  useEffect(() => {
    getProjectList(currentSelectMenu);
  }, [currentSelectMenu]);

  const sortedRows = useMemo(() => {
    console.log("sortedRows", sortSelect);
    return [...projectData]
      .filter((data) => data.title.includes(searchInput))
      .sort((a, b) => {
        if (sortSelect === "lastModified") {
          return b.lastModified - a.lastModified;
        } else if (sortSelect === "id") {
          return a.id - b.id;
        }
        return 0;
      });
  }, [projectData, searchInput, sortSelect]);

  useImperativeHandle(ref, () => ({
    handleCurrentSelectMenu,
    setNewDialogOpen,
    setUploadDialogOpen,
    setGithubDialogOpen,
  }));

  const tableRef = useRef(null);

  return (
    <div className="flex flex-col w-full">
      <ContentBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        selectedRows={selectedRows}
        tableRef={tableRef}
      ></ContentBar>
      <div className="flex justify-between gap-5 mt-5 w-full max-md:flex-wrap">
        <div className="text-xl font-semibold  text-center text-black">
          Projects Dashboard
        </div>
        <div className="flex gap-3.5">
          <div className="grow my-auto text-base font-medium text-center text-black">
            Sort By
          </div>
          <div className="flex rounded bg-gray-200 overflow-hidden">
            <Tooltip title="Table">
              <div
                className={`flex items-center justify-center w-7 h-7 cursor-pointer ${
                  sortType === "table" ? "bg-green-400" : ""
                }`}
                onClick={() => setSortType("table")}
              >
                <img src={tableSvg} alt="Table View" className="w-5 h-5" />
              </div>
            </Tooltip>
            <Tooltip title="Grid">
              <div
                className={`flex items-center justify-center w-7 h-7 cursor-pointer ${
                  sortType === "grid" ? "bg-green-400" : ""
                }`}
                onClick={() => setSortType("grid")}
              >
                <img src={gridSvg} alt="Grid View" className="w-5 h-5" />
              </div>
            </Tooltip>
          </div>
          <div className="relative inline-block text-gray-700">
            <select
              value={sortSelect}
              onChange={(event) => setSortSelect(event.target.value)}
              className="appearance-none bg-gray-200 border border-gray-300 text-gray-700 pl-1 pr-5 rounded focus:outline-none py-[0.05rem]"
            >
              <option value="lastModified">last modified</option>
              <option value="id">Id</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <img src={expandSvg} alt="expand" />
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
            handleCurrentSelectMenu={handleCurrentSelectMenu}
            ref={tableRef}
            auth={auth}
          ></Table>
        ) : (
          <Grid
            sortSelect={sortSelect}
            searchInput={searchInput}
            setSelectedRows={setSelectedRows}
            projectData={projectData}
            getProjectList={getProjectList}
            sortedRows={sortedRows}
            changeCurrentProjectRoot={changeCurrentProjectRoot}
            auth={auth}
            user={user}
          ></Grid>
        )}
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
      ></Github>
    </div>
  );
});

export default Content;
