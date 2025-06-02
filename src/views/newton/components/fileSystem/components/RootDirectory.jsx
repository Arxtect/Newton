/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import React, { useEffect, useMemo } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DirectoryLine from "./DirectoryLine";

const RootDirectory = (props) => {
  // 渲染逻辑
  return (
    <DndProvider backend={HTML5Backend}>
      <DirectoryLine {...props} />
    </DndProvider>
  );
};

export default React.memo(RootDirectory);
