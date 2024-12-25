import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
import { useUserStore, useFileStore } from "@/store";
import { formatDate } from "@/util";
import "./index.scss";
import Action from "./action";
import path from "path";

const Table = forwardRef(
  (
    {
      setSelectedRows,
      getProjectList,
      projectData,
      sortedRows,
      auth,
      currentSelectMenu,
      handleGithub,
      user,
      handleCopy,
      handleRename,
      controlShare,
      handleDeleteProject,
      setIsGitDelete,
      setIsTrashDelete,
    },
    ref
  ) => {
    const navigate = useNavigate();
    const { changeCurrentProjectRoot } = useFileStore((state) => ({
      changeCurrentProjectRoot: state.changeCurrentProjectRoot,
    }));

    // 根据父容器宽度计算列宽度

    const handleSelection = (selectedIDs) => {
      const selectedRowData = projectData.filter((row) =>
        selectedIDs.includes(row.id)
      );
      setSelectedRows(selectedRowData);
    };

    // table
    const columns = useMemo(() => {
      return [
        // {
        //   field: "id",
        //   headerName: "ID",
        //   width: 0.1,
        //   headerAlign: "center",
        //   align: "center",
        //   sortable: true, // 允许排序
        //   renderCell: (params) => (
        //     <span className="font-[500]">{params.value}</span>
        //   ),
        // },
        {
          field: "title",
          headerName: "Title",
          width: 0.3,
          headerAlign: "center",
          align: "center",
          sortable: false,
          renderCell: (params) => {
            if (params.row?.type == "git" || params.row?.isClosed) {
              return <span className="font-[500]">{params.value}</span>;
            }
            return (
              <a
                href={window.origin + `/#/newton`}
                style={{ cursor: "pointer", color: "inherit" }}
                onMouseOver={(e) =>
                  (e.target.style.textDecoration = "underline")
                }
                onMouseOut={(e) => (e.target.style.textDecoration = "none")}
                onClick={async (e) => {
                  e.preventDefault(); // 阻止默认行为，仅用于正常点击

                  const isAuth = auth(
                    params.row.name != "YOU" &&
                      (!user || JSON.stringify(user) === "{}"),
                    () => {
                      e.stopPropagation();
                      changeCurrentProjectRoot({
                        projectRoot: path.join(
                          params.row.parentDir,
                          params.value
                        ),
                        parentDir: params.row.parentDir,
                      });
                      navigate(`/newton`);
                    }
                  );
                  if (isAuth) return;
                  e.stopPropagation();
                  changeCurrentProjectRoot({
                    projectRoot: path.join(params.row.parentDir, params.value),
                    parentDir: params.row.parentDir,
                  });
                  navigate(`/newton`);
                }}
                onContextMenu={(e) => {
                  if (
                    params.row.name != "YOU" &&
                    (!user || JSON.stringify(user) === "{}")
                  ) {
                    e.preventDefault(); // 阻止默认的上下文菜单
                  } else {
                    changeCurrentProjectRoot({
                      projectRoot: path.join(
                        params.row.parentDir,
                        params.value
                      ),
                      parentDir: params.row.parentDir,
                    });
                  }
                }}
              >
                <span className="text-[#22c55e]">{params.value}</span>
              </a>
            );
          },
        },
        {
          field: "name",
          headerName: "Owner",
          width: 0.3,
          headerAlign: "center",
          align: "center",
          sortable: false,
          renderCell: (params) => (
            <span className="font-[500]">{params.value}</span>
          ),
        },
        {
          field: "lastModified",
          headerName: "Last Modified",
          width: 0.15,
          headerAlign: "center",
          align: "center",
          sortable: false, // 允许排序
          renderCell: (params) => (
            <div className="font-[500]">{formatDate(params.value)}</div>
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
            return (
              <Action
                item={params.row}
                auth={auth}
                getProjectList={getProjectList}
                handleGithub={handleGithub}
                user={user}
                handleCopy={handleCopy}
                handleRename={handleRename}
                controlShare={controlShare}
                handleDeleteProject={handleDeleteProject}
                setIsGitDelete={setIsGitDelete}
                setIsTrashDelete={setIsTrashDelete}
              ></Action>
            );
          },
        },
      ];
    }, [user, currentSelectMenu]);

    const [calculatedColumns, setCalculatedColumns] = useState([]);
    const gridRef = useRef(null);
    const [tableHeight, setTableHeight] = useState("80vh");

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
        if (gridRef.current) {
          const offsetTop = gridRef.current.getBoundingClientRect().top;
          const newHeight = `calc(100vh - ${offsetTop}px - 10px) `;
          setTableHeight(newHeight);
        }
      };
      updateColumns();
      window.addEventListener("resize", updateColumns);

      return () => window.removeEventListener("resize", updateColumns);
    }, [columns, user]);

    return (
      <div ref={gridRef}>
        <DataGrid
          rows={sortedRows}
          columns={calculatedColumns}
          disableColumnMenu
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 100 },
            },
          }}
          pageSizeOptions={[5, 10, 20, 50, 100]}
          pageSize={1000}
          checkboxSelection={
            currentSelectMenu != "git" && currentSelectMenu != "trash"
              ? true
              : false
          }
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
            maxHeight: tableHeight,
          }}
        />
      </div>
    );
  }
);

export default Table;
