/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-02-26 20:29:27
 */
import React, { useState, useEffect } from "react";
import Skeleton from "@mui/material/Skeleton";
import { getPreViewUrl } from "@/util";
const PreviewImage = ({ pageImage, height = 250, ...res }) => {
  return (
    <React.Fragment>
      {pageImage ? (
        <img
          src={getPreViewUrl(pageImage)}
          alt="PDF Image"
          className="w-full"
          {...res}
        />
      ) : (
        <Skeleton variant="rectangular" width="100%" height={height} />
      )}
    </React.Fragment>
  );
};

export default PreviewImage;
