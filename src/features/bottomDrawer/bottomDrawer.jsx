/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-05 10:20:36
 */
import React from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import GitTab from "./gitTab";
import GitHubIcon from "@mui/icons-material/GitHub";

// 假设外部控制的isOpen状态和toggleDrawer函数已经传入
const BottomDrawer = ({ isOpen, toggleDrawer }) => {
  return (
    <Drawer
      anchor="bottom"
      open={isOpen}
      onClose={() => toggleDrawer(false)}
      sx={{ height: "40vh", "& .MuiDrawer-paper": { height: "40vh" } }}
    >
      <Box sx={{ maxHeight: "40vh", overflowY: "auto" }}>
        <GitTab />
      </Box>
    </Drawer>
  );
};

export default BottomDrawer;
