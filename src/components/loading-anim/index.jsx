/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-08-27 16:51:05
 */
import React from "react";
import "./index.css";

const LoadingAnim = ({ type }) => {
  return <div className={`dot-flashing ${type}`} />;
};

export default React.memo(LoadingAnim);
