import React from "react";
import CircularProgress from "@mui/material/CircularProgress";

const Loading = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
      <CircularProgress sx={{ color: "#81c784" }} disableShrink />
      {text && <p className="text-center text-gray-700">{text}</p>}
    </div>
  );
};

export default Loading;
