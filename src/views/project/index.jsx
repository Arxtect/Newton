import React, { useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Typography,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import ArDialog from "@/components/arDialog";

import { Search as SearchIcon } from "@mui/icons-material";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DeleteIcon from "@mui/icons-material/Delete";

import { useFileStore } from "store";
import ArMenu from "@/components/arMenu";
import { findAllProjectInfo, downloadDirectoryAsZip } from "domain/filesystem";

import NewProject from "./newProject";
import UploadProject from "./uploadProject";
import CopyProject from "./copyProject";
import Github from "./github";
import { toast } from "react-toastify";
import { formatDate } from "@/util";

function Project() {
  const navigate = useNavigate();
  const {
    projectLists,
    currentProjectRoot,
    deleteProject,
    changeCurrentProjectRoot,
    getCurrentProjectPdf,
  } = useFileStore((state) => ({
    allProject: state.allProject,
    currentProjectRoot: state.currentProjectRoot,
    deleteProject: state.deleteProject,
    changeCurrentProjectRoot: state.changeCurrentProjectRoot,
    getCurrentProjectPdf: state.getCurrentProjectPdf,
  }));
  const [tableWidth, setTableWidth] = useState(0);
  const tableContainerRef = useRef(null);
  const [projectData, setProjectData] = useState([]);

  const getProjectList = async () => {
    const project = await findAllProjectInfo();
    console.log(project, "project");
    setProjectData(
      project.map((item, index) => ({
        id: index + 1,
        ...item,
      }))
    );
  };

  useEffect(() => {
    getProjectList();
  }, []);

  // 根据父容器宽度计算列宽度

  const [selectedRows, setSelectedRows] = React.useState([]);

  const handleSelection = (selectedIDs) => {
    const selectedRowData = projectData.filter((row) =>
      selectedIDs.includes(row.id)
    );
    setSelectedRows(selectedRowData);
  };

  //new project

  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

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

  //github
  const [githubDialogOpen, setGithubDialogOpen] = useState(false);

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

  // table
  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 0.1,
      headerAlign: "center",
      align: "center",
      sortable: true, // 允许排序
    },
    {
      field: "title",
      headerName: "Title",
      width: 0.3,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <div
          style={{ cursor: "pointer", color: "inherit" }}
          onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
          onMouseOut={(e) => (e.target.style.textDecoration = "none")}
          onClick={(e) => {
            e.stopPropagation();
            changeCurrentProjectRoot({
              projectRoot: params.value,
            });
            navigate(`/arxtect`);
          }}
        >
          <span
            style={{ color: "blue" }}
            onMouseOver={(e) => (e.target.style.color = "blue")}
          >
            {params.value}
          </span>
        </div>
      ),
    },
    {
      field: "owner",
      headerName: "Owner",
      width: 0.15,
      headerAlign: "center",
      align: "center",
      sortable: false,
    },
    {
      field: "lastModified",
      headerName: "LastModified",
      width: 0.15,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => <div>{formatDate(params.value)}</div>,
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 0.25,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <div>
          <Tooltip title="Copy">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setSourceProject(params.row.title);
                setCopyDialogOpen(true);
              }}
            >
              <FileCopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                downloadDirectoryAsZip(params.row.title);
              }}
            >
              <CloudDownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download PDF">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                downloadPdf(params.row.title);
              }}
            >
              <PictureAsPdfIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteProject(params.row.title);
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  useEffect(() => {
    const updateTableWidth = () => {
      if (tableContainerRef.current) {
        setTableWidth(tableContainerRef.current.offsetWidth);
      }
    };

    window.addEventListener("resize", updateTableWidth);
    updateTableWidth(); // 初始调用以设置宽度

    return () => {
      window.removeEventListener("resize", updateTableWidth);
    };
  }, []);

  const calculatedColumns = useMemo(() => {
    return columns.map((column) => ({
      ...column,
      width: tableWidth * column.width,
    }));
  }, [tableWidth]);

  return (
    <React.Fragment>
      <Box
        display="flex"
        className="h-[calc(100vh-64px)]"
        bgcolor="background.paper"
      >
        <Box
          display="flex"
          flexDirection="column"
          width={256}
          bgcolor="background.default"
          boxShadow={3}
        >
          <Box p={2} className="bg-[#c6c6c680]">
            <ArMenu
              buttonLabel="New Project"
              menuList={[
                {
                  label: "New Project",
                  onClick: () => setNewDialogOpen(true),
                },
                {
                  label: "Upload Project",
                  onClick: () => setUploadDialogOpen(true),
                },
                {
                  label: "Import from GitHub",
                  onClick: () => setGithubDialogOpen(true),
                },
              ]}
              // templateItems={{
              //   title: "Templates",
              //   items: [
              //     {
              //       label: "Academic Journal",
              //       onClick: () => console.log("Academic Journal clicked"),
              //     },
              //     { label: "Book", onClick: () => console.log("Book clicked") },
              //   ],
              // }}
            />
          </Box>
          <nav>
            <List className="py-0">
              <ListItem button component="a" href="#">
                <ListItemText primary="All Projects" />
              </ListItem>
              <ListItem button component="a" href="#">
                <ListItemText primary="Your Projects" />
              </ListItem>
              <ListItem button component="a" href="#">
                <ListItemText primary="Shared with you" />
              </ListItem>
              <ListItem button component="a" href="#">
                <ListItemText primary="Archived Projects" />
              </ListItem>
              <ListItem button component="a" href="#">
                <ListItemText primary="Trashed Projects" />
              </ListItem>
              <Divider />
              <Typography variant="subtitle2" sx={{ my: 2, mx: 2 }}>
                ORGANIZE PROJECTS
              </Typography>
              <ListItem button component="a" href="#">
                <ListItemText primary="New Tag" />
              </ListItem>
              <ListItem button component="a" href="#">
                <ListItemText primary="123" />
              </ListItem>
              <ListItem button component="a" href="#">
                <ListItemText primary="Uncategorized (6)" />
              </ListItem>
              <Divider />
              <Typography variant="subtitle2" sx={{ my: 2, mx: 2 }}>
                Are you affiliated with an institution?
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <Button variant="outlined" size="small">
                  Add Affiliation
                </Button>
              </Box>
            </List>
          </nav>
        </Box>
        <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
          <Box
            bgcolor="background.default"
            borderBottom={1}
            borderColor="divider"
            className="h-full bg-[#f4f5f6]"
            p={3}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6">All Projects</Typography>
              <Box display="flex" alignItems="center">
                <Typography variant="body2" sx={{ mx: 2 }}>
                  You're on the free plan
                </Typography>
                <Button variant="contained" color="primary" size="small">
                  Upgrade
                </Button>
              </Box>
            </Box>
            <Box display="flex" my={2}>
              <TextField
                size="small"
                sx={{
                  width: "50%",
                  "& .MuiInputBase-input": {
                    borderRadius: 0,
                  },
                }}
                id="outlined-start-adornment"
                placeholder="Search in all projects..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <Box>
              <Paper ref={tableContainerRef}>
                <DataGrid
                  rows={projectData}
                  columns={calculatedColumns}
                  disableColumnMenu
                  rowHeight={40}
                  // initialState={{
                  //   pagination: {
                  //     paginationModel: { page: 0, pageSize: 5 },
                  //   },
                  // }}
                  // pageSizeOptions={[5, 10]}\
                  pageSize={5}
                  checkboxSelection={true}
                  onRowSelectionModelChange={handleSelection}
                  disableRowSelectionOnClick
                  onCellDoubleClick={(params) => console.log(params)}
                />
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
      <NewProject dialogOpen={newDialogOpen} setDialogOpen={setNewDialogOpen} />
      <UploadProject
        dialogOpen={uploadDialogOpen}
        setDialogOpen={setUploadDialogOpen}
      />
      <CopyProject
        dialogOpen={copyDialogOpen}
        setDialogOpen={setCopyDialogOpen}
        sourceProject={sourceProject}
        getProjectList={getProjectList}
      />
      <Github
        dialogOpen={githubDialogOpen}
        setDialogOpen={setGithubDialogOpen}
        getProjectList={getProjectList}
      ></Github>
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
    </React.Fragment>
  );
}

export default Project;
