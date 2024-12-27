/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-12-27 11:40:42
 */
import React, { useEffect, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DirectoryLine from "./DirectoryLine";

const RootDirectory = (props) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <DirectoryLine {...props} />
    </DndProvider>
  );
};

export default RootDirectory;
