import React, { useEffect } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import DirectoryLine from './DirectoryLine'; // 假设这是你的组件路径

const RootDirectory = (props) => {

    // 渲染逻辑
    return <DirectoryLine {...props} />;
};

export default DragDropContext(HTML5Backend)(RootDirectory);
