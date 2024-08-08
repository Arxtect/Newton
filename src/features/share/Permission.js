import React from "react";
import { ExpandMore } from "@mui/icons-material";
import "./index.css";

function Permission({ status, onChange, isRemove }) {
  return (
    <div className="flex relative text-gray-700">
      <select
        value={status}
        onChange={onChange}
        className="appearance-none bg-[#81c684] border border-gray-300 pl-3 pr-7 text-sm rounded-md focus:outline-none py-[0.2rem] custom-select"
      >
        <option value="r">Can view</option>
        <option value="rw">Can edit</option>
        {isRemove && <option value="remove">Remove</option>}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-700">
        <ExpandMore />
      </div>
    </div>
  );
}

export default Permission;
