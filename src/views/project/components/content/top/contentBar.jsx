/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-07-30 15:02:25
 */
import * as React from "react";
import SearchBar from "./searchBar";
import ActionBar from "./actionBar";

const ContentBar = ({
  searchInput,
  setSearchInput,
  selectedRows,
  auth,
  user,
  getProjectList,
  handleCopy,
  handleRename,
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
            handleCopy={handleCopy}
            handleRename={handleRename}
            selectedRows={selectedRows}
            getProjectList={getProjectList}
            auth={auth}
            user={user}
          />
        ) : (
          <React.Fragment>
            <div className="grow my-auto text-black">
              You’re on the free plan
            </div>
            <div className="my-1 px-3 flex items-center text-white whitespace-nowrap bg-arxTheme rounded-xl">
              Upgrade
            </div>
            {/* Display action bar only when there are selected rows */}
          </React.Fragment>
        )}
      </div>
    </div>
  );
};

export default ContentBar;
