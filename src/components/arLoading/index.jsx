import React from "react";
import CircularProgress from "@mui/material/CircularProgress";

const ArLoadingScreen = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full space-y-4">
      <CircularProgress sx={{ color: "#81c784" }} disableShrink />
      {text && <p className="text-center text-gray-700">{text}</p>}
    </div>
  );
};

const ArLoadingOverlay = ({ text, loading, children }) => {
  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
          <CircularProgress sx={{ color: "#81c784" }} disableShrink />
          {text && <p className="text-center text-gray-700 mt-2">{text}</p>}
        </div>
      )}
      <div className={`w-full h-full ${loading ? "opacity-50" : ""}`}>
        {children}
      </div>
    </div>
  );
};

export { ArLoadingScreen, ArLoadingOverlay };
