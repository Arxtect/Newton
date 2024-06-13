import React from "react";
import { CircularProgress } from "@mui/material";

const ArgButton = ({
  onClick,
  loading = false,
  color = "blue",
  variant = "contained",
  children,
  className = "",
  ...res
}) => {
  const buttonClasses = `
        font-bold py-2 px-4 rounded flex items-center justify-center
        ${loading ? "cursor-not-allowed" : ""}
        ${className}
    `;

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={buttonClasses}
      {...res}
    >
      {loading && (
        <CircularProgress size={24} className="mr-2" color="success" />
      )}
      {children}
    </button>
  );
};

export default ArgButton;
