import React, { useState, useRef } from "react";
import ContentBar from "./contentBar";
import Grid from "./grid";
import Table from "./table";
import tableSvg from "@/assets/project/table.svg";
import gridSvg from "@/assets/project/grid.svg";
import expandSvg from "@/assets/project/expand.svg";

import { Tooltip } from "@mui/material";

const Content = () => {
  const [sortType, setSortType] = useState("table");
  const [sortSelect, setSortSelect] = useState("lastModified");
  // search
  const [searchInput, setSearchInput] = useState("");
  const [selectedRows, setSelectedRows] = React.useState([]);

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
            ref={tableRef}
          ></Table>
        ) : (
          <Grid
            sortSelect={sortSelect}
            searchInput={searchInput}
            setSelectedRows={setSelectedRows}
          ></Grid>
        )}
      </div>
    </div>
  );
};

export default Content;
