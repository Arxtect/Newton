import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { IconButton, Tooltip } from "@mui/material";
import {
  findAllProjectInfo,
  downloadDirectoryAsZip,
  getProjectInfo,
} from "domain/filesystem";
import { toast } from "react-toastify";
import { useUserStore, useLoginStore, useFileStore } from "@/store";
import { formatDate } from "@/util";
import { ProjectSync } from "@/convergence";
import ArDialog from "@/components/arDialog";

import CopyProject from "../copyProject";
import RenameProject from "../renameProject";
import Share from "../share";
import copySvg from "@/assets/project/copy.svg";
import deleteSvg from "@/assets/project/delete.svg";
import downloadSvg from "@/assets/project/download.svg";
import gitCloudSvg from "@/assets/project/gitCloud.svg";
import renameSvg from "@/assets/project/rename.svg";
import shareSvg from "@/assets/project/share.svg";
import downloadPdfSvg from "@/assets/project/downloadPdf.svg";
import "./index.scss";
import { getYDocToken } from "services";

const Table = forwardRef(
  ({ setSelectedRows, getProjectList, projectData, sortedRows, auth,currentSelectMenu,handleGithub }, ref) => {
    const navigate = useNavigate();
    const {
      projectLists,
      currentProjectRoot,
      deleteProject,
      changeCurrentProjectRoot,
      getCurrentProjectPdf,
      initFile,
    } = useFileStore((state) => ({
      allProject: state.allProject,
      currentProjectRoot: state.currentProjectRoot,
      deleteProject: state.deleteProject,
      changeCurrentProjectRoot: state.changeCurrentProjectRoot,
      getCurrentProjectPdf: state.getCurrentProjectPdf,
      initFile: state.initFile,
    }));

    const { user, accessToken } = useUserStore((state) => ({
      user: state.user,
      accessToken: state.accessToken,
    }));

    const { updateDialogLoginOpen, updateOtherOperation } = useLoginStore(
      (state) => ({
        updateDialogLoginOpen: state.updateDialogLoginOpen,
        updateOtherOperation: state.updateOtherOperation,
      })
    );

    // 根据父容器宽度计算列宽度

    const handleSelection = (selectedIDs) => {
      const selectedRowData = projectData.filter((row) =>
        selectedIDs.includes(row.id)
      );
      setSelectedRows(selectedRowData);
    };

    // delete project
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteProjectName, setDeleteProjectName] = useState("");

    const handleDeleteProject = (deleteProjectName) => {
      if (!deleteProjectName) {
        toast.error("Please select a project to delete");
        return;
      }
      setDeleteDialogOpen(true);
      setDeleteProjectName(deleteProjectName);
    };

    const handleConfirmDelete = async () => {
      await deleteProject({ dirpath: deleteProjectName });
      getProjectList();
      setDeleteDialogOpen(false);
    };
    const handleCancelDelete = () => {
      setDeleteDialogOpen(false);
    };

    //copy project
    const [sourceProject, setSourceProject] = useState("");
    const [copyDialogOpen, setCopyDialogOpen] = useState(false);
    const handleCopy = (title) => {
      setSourceProject(title);
      setCopyDialogOpen(true);
    };

    // share project
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareProjectName, setShareProjectName] = useState("");

    const controlShare = (project) => {
      console.log(user, accessToken, "user");
      if (!user || JSON.stringify(user) === "{}") {
        toast.warning("Please login");
        updateDialogLoginOpen(true);
        return;
      }
      setShareProjectName(project);
      setShareDialogOpen(true);
    };

    // download pdf
    const downloadPdf = async (projectName) => {
      const blobUrl = await getCurrentProjectPdf(projectName);
      console.log(blobUrl, "blobUrl");

      if (!blobUrl) {
        toast.warning("project is not compiled please compile it first");
        return;
      }
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = projectName + ".pdf";
      link.click();
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 30000);
    };

    //rename project
    const [renameSourceProject, setRenameSourceProject] = useState("");
    const [renameDialogOpen, setRenameDialogOpen] = useState(false);
    const handleRename = (title) => {
      setRenameSourceProject(title);
      setRenameDialogOpen(true);
    };

    // table
    const columns = [
      {
        field: "id",
        headerName: "ID",
        width: 0.1,
        headerAlign: "center",
        align: "center",
        sortable: true, // 允许排序
        renderCell: (params) => (
          <span className="font-bold">{params.value}</span>
        ),
      },
      {
        field: "title",
        headerName: "Title",
        width: 0.3,
        headerAlign: "center",
        align: "center",
        sortable: false,
        renderCell: (params) => {
           if(params.row?.type=="git"){
            return <span className="font-bold">{params.value}</span>
          }
          return <div
            style={{ cursor: "pointer", color: "inherit" }}
            onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
            onMouseOut={(e) => (e.target.style.textDecoration = "none")}
            onClick={async (e) => {
              const isAuth = auth(
                params.row.name != "YOU" &&
                  (!user || JSON.stringify(user) === "{}"),
                () => {
                  e.stopPropagation();
                  changeCurrentProjectRoot({
                    projectRoot: params.value,
                  });
                  navigate(`/newton`);
                }
              );
              if (isAuth) return;
              e.stopPropagation();
              changeCurrentProjectRoot({
                projectRoot: params.value,
              });
              navigate(`/newton`);
            }}
          >
            <span className="text-[#22c55e]">{params.value}</span>
          </div>
        },
      },
      {
        field: "name",
        headerName: "Owner",
        width: 0.2,
        headerAlign: "center",
        align: "center",
        sortable: false,
        renderCell: (params) => (
          <span className="font-bold">{params.value}</span>
        ),
      },
      {
        field: "lastModified",
        headerName: "LastModified",
        width: 0.15,
        headerAlign: "center",
        align: "center",
        sortable: false, // 允许排序
        renderCell: (params) => (
          <div className="font-bold">{formatDate(params.value)}</div>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        width: 0.25,
        headerAlign: "center",
        align: "center",
        sortable: false,
        renderCell: (params) => {
           if(params.row?.type=="git"){
            return  <Tooltip title="Import">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGithub(true,params.row.title)
                }}
              >

                <img src={gitCloudSvg} className="w-4" alt="" />
              </IconButton>
            </Tooltip>
          }
          return <div>
            <Tooltip title="Download">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  const isAuth = auth(
                    params.row.name != "YOU" &&
                      (!user || JSON.stringify(user) === "{}"),
                    () => {
                      downloadDirectoryAsZip(params.row.title);
                    }
                  );
                  if (isAuth) return;
                  downloadDirectoryAsZip(params.row.title);
                }}
              >
                <img src={downloadSvg} alt="" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Copy">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  const isAuth = auth(
                    params.row.name != "YOU" &&
                      (!user || JSON.stringify(user) === "{}"),
                    () => {
                      handleCopy(params.row.title);
                    }
                  );
                  if (isAuth) return;
                  handleCopy(params.row.title);
                }}
              >
                <img src={copySvg} alt="" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Download PDF">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  const isAuth = auth(
                    params.row.name != "YOU" &&
                      (!user || JSON.stringify(user) === "{}"),
                    () => {
                      downloadPdf(params.row.title);
                    }
                  );
                  if (isAuth) return;
                  downloadPdf(params.row.title);
                }}
              >
                <img src={downloadPdfSvg} alt="" />
              </IconButton>
            </Tooltip>
            <Tooltip title="SHARE">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log(params.row.userId, user.id, "params.row");
                  if (params.row.userId && params.row.userId != user.id) {
                    toast.warning(
                      "This project is collaborative and cannot be shared"
                    );
                    return;
                  }
                  const isAuth = auth(
                    params.row.name != "YOU" &&
                      (!user || JSON.stringify(user) === "{}"),
                    () => {
                      controlShare(params.row.title);
                    }
                  );
                  if (isAuth) return;
                  controlShare(params.row.title);
                }}
              >
                <img src={shareSvg} alt="" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  const isAuth = auth(
                    params.row.name != "YOU" &&
                      (!user || JSON.stringify(user) === "{}"),
                    () => {
                      handleDeleteProject(params.row.title);
                    }
                  );
                  if (isAuth) return;
                  handleDeleteProject(params.row.title);
                }}
              >
                <img src={deleteSvg} alt="" />
              </IconButton>
            </Tooltip>
          </div>
        }
          
      },
    ];

    const [calculatedColumns, setCalculatedColumns] = useState([]);

    useLayoutEffect(() => {
      const updateColumns = () => {
        const viewportWidth = window.innerWidth;
        const totalWidth = columns.reduce(
          (sum, column) => sum + column.width,
          0
        );
        setCalculatedColumns(
          columns.map((column) => ({
            ...column,
            width: (viewportWidth * 0.7 * column.width) / totalWidth,
          }))
        );
      };

      updateColumns();
      window.addEventListener("resize", updateColumns);

      return () => window.removeEventListener("resize", updateColumns);
    }, []);

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
      console.log(token, "token");
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
        toast.warning("Please login");
        updateDialogLoginOpen(true);
        updateOtherOperation(() => handleSyncProject(project, roomId));
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

    useImperativeHandle(ref, () => ({
      handleCopy,
      handleRename,
    }));

    return (
      <div>
        <DataGrid
          rows={sortedRows}
          columns={calculatedColumns}
          disableColumnMenu
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 },
            },
          }}
          pageSizeOptions={[5, 10]}
          pageSize={10}
          checkboxSelection={currentSelectMenu!="git"?true:false}
          onRowSelectionModelChange={handleSelection}
          disableRowSelectionOnClick
          onCellDoubleClick={(params) => console.log(params)}
          rowHeight={40}
          columnHeaderHeight={50}
          sx={{
            "& .MuiDataGrid-footerContainer": {
              minHeight: 40,
            },
            "& .MuiTablePagination-toolbar": {
              minHeight: 40,
            },
          }}
        />

        <CopyProject
          dialogOpen={copyDialogOpen}
          setDialogOpen={setCopyDialogOpen}
          sourceProject={sourceProject}
          setSourceProject={setSourceProject}
          getProjectList={getProjectList}
        />
        <RenameProject
          dialogOpen={renameDialogOpen}
          setDialogOpen={setRenameDialogOpen}
          sourceProject={renameSourceProject}
          setSourceProject={setRenameSourceProject}
          getProjectList={getProjectList}
        />
        <Share
          dialogOpen={shareDialogOpen}
          setDialogOpen={setShareDialogOpen}
          rootPath={shareProjectName}
          user={user}
          getProjectList={getProjectList}
        ></Share>
        <ArDialog
          title="Delete Project"
          dialogOpen={deleteDialogOpen}
          handleCancel={handleCancelDelete}
          buttonList={[
            { title: "Cancel", click: handleCancelDelete },
            { title: "Delete", click: handleConfirmDelete },
          ]}
        >
          Are you sure you want to delete the project：
          <span className="text-red-500 mr-1">{deleteProjectName}</span>
        </ArDialog>
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

export default Table;
