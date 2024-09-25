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
import Tooltip from "@/components/tooltip";

import {
  findAllProjectInfo,
  downloadDirectoryAsZip,
  getProjectInfo,
} from "domain/filesystem";
import { useUserStore, useFileStore } from "@/store";
import NewProject from "../newProject";
import UploadProject from "../uploadProject";
import Github from "../github";
import { toast } from "react-toastify";
import ArDialog from "@/components/arDialog";
import {
  getYDocToken,
  deleteGitRepo,
  getGitRepoList,
  getRoomUserAccess,
} from "services";
import { useNavigate } from "react-router-dom";
import { ProjectSync } from "@/convergence";

import ArIcon from "@/components/arIcon";
import { useAuthCallback } from "@/useHooks";

const Content = React.forwardRef(
  ({ currentSelectMenu, setCurrentSelectMenu }, ref) => {
    const authCallback = useAuthCallback();
    const { changeCurrentProjectRoot } = useFileStore((state) => ({
      changeCurrentProjectRoot: state.changeCurrentProjectRoot,
    }));

    const auth = (condition, callback) => {
      if (condition) {
        authCallback(callback, "Please login first");
        return true;
      }
      return false;
    };
    const navigate = useNavigate();

    const [sortType, setSortType] = useState("table");
    const [sortSelect, setSortSelect] = useState("lastModified");
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
    const [projectName, setProjectName] = useState("");

    useEffect(() => {
      if (sortType === "table") return;
      setSelectedRows([]);
    }, [sortType]);

    const [projectData, setProjectData] = useState([]);

    const getRepoList = async () => {
      try {
        const res = await getGitRepoList();

        let data = res?.data;

        if (!data?.length) return [];

        let projectData = data.map((item) => {
          const { name, updated_at, ...res } = item;
          return {
            ...res,
            title: name,
            lastModified: updated_at,
            name: item.owner?.login,
            type: "git",
          };
        });

        console.log(projectData, "1111");
        return projectData;
      } catch (err) {
        toast.warning(err);
      }
    };

    // handle switch slide menu
    const handleSwitchMenu = (menu, user, item, index) => {
      if (!user?.email && item.name != "YOU") {
        return null;
      }
      switch (menu) {
        case "trash":
          if (item.isClosed) {
            return {
              id: index + 1,
              ...item,
            };
          }
          break;
        case "category":
          return null;
        case "shared":
          if (item?.email != user?.email && item?.isSync && !item.isClosed) {
            return {
              id: index + 1,
              ...item,
            };
          }
          break;
        case "your":
          if (
            !item.isClosed &&
            (item?.email == user?.email || item.name == "YOU")
          ) {
            return {
              id: index + 1,
              ...item,
            };
          }
          break;
        case "all":
          if (user?.email && !item.isClosed) {
            return {
              id: index + 1,
              ...item,
            };
          } else if (item.name == "YOU" && !item.isClosed) {
            return {
              id: index + 1,
              ...item,
            };
          }
          break;
        case "git":
          return {
            id: index + 1,
            ...item,
          };
        default:
          break;
      }
    };

    const getProjectList = async () => {
      console.log(currentSelectMenu, "currentSelectMenu");
      let project = [];

      if (currentSelectMenu == "git") {
        project = await getRepoList();
      } else {
        project = await findAllProjectInfo();
      }
      if (!project) return;

      console.log(project, "project");
      const projectData = project
        .map((item, index) => {
          return handleSwitchMenu(currentSelectMenu, user, item, index);
        })
        .filter((item) => item?.title);
      setProjectData(projectData);
    };

    useEffect(() => {
      getProjectList();
    }, [currentSelectMenu]); //user

    const sortedRows = useMemo(() => {
      return [...projectData]
        .filter((data) => data.title.includes(searchInput))
        .sort((a, b) => {
          if (sortSelect === "lastModified") {
            return b.lastModified - a.lastModified;
          } else if (sortSelect === "lastCreated") {
            return b.created_at - a.created_at;
          } else if (sortSelect === "alphabetical") {
            return a.title.localeCompare(b.title);
          }
          return 0;
        });
    }, [projectData, searchInput, sortSelect]);

    useImperativeHandle(ref, () => ({
      setNewDialogOpen,
      setUploadDialogOpen,
      setGithubDialogOpen,
    }));

    const tableRef = useRef(null);

    const handleGithub = (open, proejctName) => {
      setGithubDialogOpen(open);
      setProjectName(proejctName);
    };

    // sync project
    const [projectSync, setProjectSync] = useState(null);

    const [syncDialogOpen, setSyncDialogOpen] = useState(false);

    const [syncParams, setSyncParams] = useState({});

    const handleSyncProject = (syncProjectName, roomId) => {
      setSyncParams({ roomId, project: syncProjectName });
      setSyncDialogOpen(true);
    };
    const getYDocTokenReq = async () => {
      const token = await getYDocToken();
      return token;
    };
    const handleConfirmSync = async () => {
      const token = await getYDocTokenReq();
      const projectSync = new ProjectSync(
        syncParams.project,
        user,
        syncParams.roomId,
        token,
        getProjectList
      );
      await projectSync.setObserveHandler();

      setProjectSync(projectSync);
      setSyncDialogOpen(false);
    };
    const handleCancelSync = () => {
      setSyncDialogOpen(false);
    };

    const initShareProject = async () => {
      const hash = window.location.hash;
      const queryString = hash.includes("?") ? hash.split("?")[1] : "";
      const searchParams = new URLSearchParams(queryString);

      const project = searchParams.get("project");
      const roomId = searchParams.get("roomId");

      if (!project || !roomId) return;

      if (!user || JSON.stringify(user) === "{}") {
        authCallback(() => handleSyncProject(project, roomId));
        return;
      }

      const res = await getRoomUserAccess({
        project_name: project + roomId,
      });
      if (res?.status != "success") {
        toast.error("Get room user access failed.");
        return;
      }

      if (res?.access == "r") {
        toast.info(
          "The project is read-only for you, please contact your project manager to modify it."
        );
      }

      if (res?.access == "no") {
        toast.info(
          "The project is not shared for you, please contact your project manager to modify it."
        );
        navigate("/project");
        return;
      }

      handleSyncProject(project, roomId);
    };

    useEffect(() => {
      const init = async () => {
        await initShareProject(getProjectList);
      };

      init();
      getProjectList();
      return () => {
        if (projectSync) {
          projectSync?.leaveCollaboration && projectSync?.leaveCollaboration();
        }
      };
    }, []);

    return (
      <div className="flex flex-col w-full">
        <ContentBar
          searchInput={searchInput}
          setSearchInput={setSearchInput}
          selectedRows={selectedRows}
          tableRef={tableRef}
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
                  className="w-4 ml-2 cursor-pointer text-arxTheme"
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
              ref={tableRef}
              auth={auth}
              handleGithub={handleGithub}
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
            ></Grid>
          )}
        </div>
        <NewProject
          dialogOpen={newDialogOpen}
          setDialogOpen={setNewDialogOpen}
        />
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
        <ArDialog
          title="Sync Project"
          dialogOpen={syncDialogOpen}
          handleCancel={handleCancelSync}
          buttonList={[
            { title: "Cancel", click: handleCancelSync },
            { title: "Confirm", click: handleConfirmSync },
          ]}
        >
          Whether to enter the collaboration project:
          <span className="text-red-500 mr-1">{syncParams.project}</span>
        </ArDialog>
      </div>
    );
  }
);

export default Content;
