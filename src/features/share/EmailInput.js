/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-08-08 11:34:15
 */
import React, { useState } from "react";
import { Box, InputBase } from "@mui/material";
import { styled } from "@mui/system";
import Permission from "./Permission";
import { toast } from "react-toastify";

const SearchBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  backgroundColor: "#f4f4f4",
  borderRadius: "8px",
  padding: "5px 20px",
  width: "100%",
  height: "34px",
  boxSizing: "border-box",
});

const SearchInput = styled(InputBase)({
  flex: 1,
  fontSize: "1rem",
  "& .MuiInputBase-input": {
    padding: 0,
    backgroundColor: "#f4f4f4",
    border: "none",
  },
  "& .MuiInputBase-input::placeholder": {
    fontSize: "14px", // Adjust the font size here
    color: "#855f5f", // Adjust the color here
  },
  "& .MuiInputBase-input:-webkit-autofill": {
    WebkitBoxShadow: "0 0 0 30px #f4f4f4 inset !important", // Adjust the background color here
    WebkitTextFillColor: "#855f5f", // Adjust the text color here
  },
});

function EmailInput({ handleInvite }) {
  const [searchInput, setSearchInput] = useState("");
  const [userStatus, setUserStatus] = useState("rw");
  const handleStatusChange = (event) => {
    setUserStatus(event.target.value);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleInviteSubmit = async (event) => {
    if (!validateEmail(searchInput)) {
      toast.warning("Please enter a valid email");
      return;
    }
    event.preventDefault();
    console.log(searchInput, "searchInput");
    let status = await handleInvite(searchInput, userStatus);
    status == "success" && setSearchInput("");
  };

  return (
    <form className="flex justify-between text-xs gap-5">
      <div className="flex flex-auto gap-10 py-1 pr-2  rounded-lg">
        <SearchBox>
          <SearchInput
            placeholder="Email, Comma separated"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <Permission status={userStatus} onChange={handleStatusChange} />
        </SearchBox>
      </div>
      <button
        type="submit"
        onClick={handleInviteSubmit}
        className="w-24 text-[1rem] px-4 my-1 text-center text-black whitespace-nowrap bg-[#81c684] rounded-md"
      >
        Invite
      </button>
    </form>
  );
}

export default EmailInput;
