import React from 'react';
import { DragSource, DropTarget } from 'react-dnd';
import fs from 'fs';
import path from 'path';
import pify from 'pify';

const DND_GROUP = 'browser';

const fileSource = {
    beginDrag(props) {
        return props;
    },
};

const fileTarget = {
    drop(dropProps, monitor) {
        if (monitor) {
            const dragProps = monitor.getItem();
            if (dropProps.pathname !== dragProps.pathname) {
                moveItem(dragProps, dropProps).then((result) => {
                    dropProps.onDropByOther(result);
                    dragProps.onDrop(result);
                });
            }
        }
    },
};

async function moveItem(from, to) {
    if (from.pathname === to.pathname) {
        return;
    }
    if (to.type === 'dir') {
        const fromPath = from.pathname;
        const basename = path.basename(from.pathname);
        const destPath = path.join(to.pathname, basename);

        await pify(fs.rename)(fromPath, destPath);
        return {
            fromPath,
            destPath,
        };
    }
}

function DraggableItem(props) {
    const { connectDragSource, connectDropTarget, isDragging, children } = props;
    const opacity = isDragging ? 0.4 : 1;
    return connectDragSource(
        connectDropTarget(<div style={{ opacity }}>{children}</div>)
    );
}

export default DropTarget(
    DND_GROUP,
    fileTarget,
    (connect) => ({
        connectDropTarget: connect.dropTarget(),
    })
)(
    DragSource(
        DND_GROUP,
        fileSource,
        (connect, monitor) => ({
            connectDragSource: connect.dragSource(),
            isDragging: monitor.isDragging(),
        })
    )(DraggableItem)
);
