/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import React from "react";
import { DragSource, DropTarget } from "react-dnd";
import fs from "fs";
import path from "path";
import pify from "pify";


const DND_GROUP = "browser";

const fileSource = {
  beginDrag(props) {
    console.log('Begin drag:', props);
    return props;
  },
};

const fileTarget = {
  drop(dropProps, monitor) {
    console.log('Drop event:', dropProps, monitor.getItem(),monitor.didDrop());
    if (monitor) {
      const dragProps = monitor.getItem();
      console.log(dragProps, "dragProps");
      if (dropProps.pathname !== dragProps.pathname) {
        moveItem(dragProps, dropProps).then((result) => {
          dropProps.onDropByOther(result);
          dragProps.onDrop(result);
        });
      }
    }
  },
  hover(props, monitor, component) {
    if (monitor.isOver()) {
      const event = monitor.getClientOffset();
      if (event) {
        console.log('Hover event:', event);
      }
    }
  },
};

async function moveItem(from, to) {
  if (from.pathname === to.pathname) {
    return;
  }
  console.log("moveItem", from, to);
  if (to.type === "dir") {
    const fromPath = from.pathname;
    const basename = path.basename(from.pathname);
    const destPath = path.join(to.pathname, basename);

    await pify(fs.rename)(fromPath, destPath);
    return {
      fromPath,
      destPath,
    };
  }
  if (to.type === "file") {
    const fromPath = from.pathname;
    const basename = path.basename(from.pathname);
    const destPath = path.join(path.dirname(to.pathname), basename);
    console.log("moveItem", fromPath, destPath);
    await pify(fs.rename)(fromPath, destPath);
    return {
      fromPath,
      destPath,
    };
  }

}

function DraggableItem(props) {
  const {
    connectDragSource,
    connectDropTarget,
    isDragging,
    children,
    isHover,
  } = props;
  const opacity = isDragging ? 0.4 : 1;
  const backgroundColor = isHover ? "#eaf6ea" : "";
  return connectDragSource(
    connectDropTarget(
      <div className="drop-target" style={{ opacity, backgroundColor }}>
        {children}
      </div>
    )
  );
}


const DraggableDropTargetItem = React.memo(
  DropTarget(DND_GROUP, fileTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isHover: monitor?.isOver(),
  }))(
    DragSource(DND_GROUP, fileSource, (connect, monitor) => ({
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging(),
    }))(DraggableItem)
  )
);

const DraggableAndDroppable = ({ isEnabled = true, children, ...props }) => {
  if (isEnabled) {
    return <DraggableDropTargetItem {...props}>{children}</DraggableDropTargetItem>;
  } else {
    return <div {...props}>{children}</div>;
  }
};

export default DraggableAndDroppable;
// export default DropTarget(DND_GROUP, fileTarget, (connect) => ({
//       connectDropTarget: connect.dropTarget(),
//     }))(
//       DragSource(DND_GROUP, fileSource, (connect, monitor) => ({
//         connectDragSource: connect.dragSource(),
//         isDragging: monitor.isDragging(),
//       }))(DraggableItem)
//     );