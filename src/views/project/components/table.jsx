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
import { useUserStore, useFileStore } from "@/store";
import { formatDate } from "@/util";
import "./index.scss";
import Action from "./action";

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
    },
    ref
  ) => {
    const navigate = useNavigate();
    const { changeCurrentProjectRoot } = useFileStore((state) => ({
      changeCurrentProjectRoot: state.changeCurrentProjectRoot,
    }));

    const { user, accessToken } = useUserStore((state) => ({
      user: state.user,
      accessToken: state.accessToken,
    }));

    // 根据父容器宽度计算列宽度

    const handleSelection = (selectedIDs) => {
      const selectedRowData = projectData.filter((row) =>
        selectedIDs.includes(row.id)
      );
      setSelectedRows(selectedRowData);
    };

    // table
    const columns = [
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
            <div
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
              ref={actionRef}
            ></Action>
          );
        },
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
    }, [user, currentSelectMenu]);

    const actionRef = useRef(null);

    useImperativeHandle(ref, () => ({
      handleCopy: actionRef.current && actionRef.current.handleCopy,
      handleRename: actionRef.current && actionRef.current.handleRename,
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
          }}
        />
      </div>
    );
  }
);

export default Table;
