/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-07-30 15:02:25
 */
import * as React from "react";
import SearchBar from "./searchBar";
import ActionBar from "../actionBar";

const ContentBar = ({
  searchInput,
  setSearchInput,
  selectedRows,
  tableRef,
}) => {
  return (
    <div className="flex gap-5 items-center justify-between w-full font-medium text-center mt-2">
      <SearchBar
        searchInput={searchInput}
        setSearchInput={setSearchInput}
      ></SearchBar>

      <div className="flex gap-3.5 h-full">
        {selectedRows.length > 0 ? (
          <ActionBar
            handleCopy={tableRef.current.handleCopy}
            handleRename={tableRef.current.handleRename}
            selectedRows={selectedRows}
            getProjectList={tableRef.current.getProjectList}
            auth={tableRef.current.auth}
            user={tableRef.current.user}
          />
        ) : (
          <React.Fragment>
            <div className="grow my-auto text-black">
              You’re on the free plan
            </div>
            <div className="my-1 px-3 flex items-center text-white whitespace-nowrap bg-arxTheme rounded-xl">
              Upgrade
            </div>
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default ContentBar;
