import React from "react";
import { Box, InputBase } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/system";

const SearchBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  backgroundColor: "#f5f5f5",
  borderRadius: "25px",
  padding: "5px 20px",
  width: "300px",
  height: "40px",
  boxSizing: "border-box",
});

const SearchInput = styled(InputBase)({
  marginLeft: "10px",
  flex: 1,
  color: "#8c8c8c",
  fontSize: "16px",
  "& .MuiInputBase-input": {
    padding: 0,
    background: "transparent",
    border: "none",
  },
});

const SearchBar = ({ searchInput, setSearchInput }) => {
  return (
    <SearchBox>
      <SearchIcon style={{ color: "#8c8c8c" }} />
      <SearchInput
        placeholder="Search in Projects"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
      />
    </SearchBox>
  );
};

export default SearchBar;
