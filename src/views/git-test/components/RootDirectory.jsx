import React, { useEffect } from 'react';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import DirectoryLine from './DirectoryLine'; // 假设这是你的组件路径

const RootDirectory = (props) => {
    useEffect(() => {
        // 异步操作可以在这里执行
        const fetchData = async () => {
            // 你的 componentDidMount 逻辑
        };

        fetchData();
    }, []); // 空数组确保仅在组件挂载时执行

    // 渲染逻辑
    return <DirectoryLine {...props} />;
};

export default DragDropContext(HTML5Backend)(RootDirectory);
