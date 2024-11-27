import React, { useEffect, useState } from "react";
import { DragSource, DropTarget } from "react-dnd";
import fs from "fs";
import path from "path";
import pify from "pify";
import onExternalDrop from "./uploadFuntion";

const DND_GROUP = "browser";

const fileSource = {
  beginDrag(props) {
    console.log("Begin drag:", props);
    return { items: [...props.group] }; // 返回一个包含多个拖动项信息的对象数组
  },
};

const fileTarget = {
  drop(dropProps, monitor) {
    if (monitor) {
      const dragProps = monitor.getItem();
      console.log("dragProps", dragProps);
      dragProps.items.forEach((item) => {
        if (dropProps.pathname !== item.pathname) {
          moveItem(item, dropProps).then((result) => {
            dropProps.onDropByOther(result);
            item.onDrop(result);
          });
        }
      });
    }
  },
  hover(props, monitor, component) {
    if (monitor.isOver()) {
      const event = monitor.getClientOffset();
      if (event) {
        console.log("Hover event:", event);
      }
    }
  },
};

async function moveItem(from, to) {
  if (from.pathname === to.pathname) {
    return;
  }
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
    await pify(fs.rename)(fromPath, destPath);
    return {
      fromPath,
      destPath,
    };
  }
}

function DraggableItem(props) {
  console.log("DraggableItem", props);
  const {
    connectDragSource,
    connectDropTarget,
    isDragging,
    children,
    isHover,
    externalHover,
  } = props;
  const opacity = isDragging ? 0.4 : 1;
  const backgroundColor = isHover || externalHover ? "#eaf6ea" : "";

  return connectDragSource(
    connectDropTarget(
      <div
        className="drop-target"
        style={{
          opacity: props.isEnabled ? opacity : 1,
          backgroundColor: props.isEnabled ? backgroundColor : "",
          pointerEvents: props.isEnabled ? "auto" : "none",
        }}
      >
        {children}
      </div>
    )
  );
}

const DraggableDropTargetItem = React.memo(
  DropTarget(DND_GROUP, fileTarget, (connect, monitor) => ({
    connectDropTarget: connect.dropTarget(),
    isHover: monitor.isOver(),
  }))(
    DragSource(DND_GROUP, fileSource, (connect, monitor) => ({
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging(),
    }))(DraggableItem)
  )
);

const DraggableAndDroppable = ({
  isEnabled = true,
  children,
  projectSync,
  reload,
  ...props
}) => {
  const [externalHover, setExternalHover] = useState(false);

  useEffect(() => {
    const handleDragOver = (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "copy";
      setExternalHover(true);
    };

    const handleDrop = (event) => {
      setExternalHover(false);
      const items = event.dataTransfer.items;
      const files = event.dataTransfer.files;
      if (files.length > 0) {
        onExternalDrop(
          items,
          props.type == "file" ? path.dirname(props.pathname) : props.pathname,
          projectSync,
          reload
        );
      }
    };

    const handleDragLeave = (event) => {
      event.preventDefault();
      event.stopPropagation();
      setExternalHover(false);
    };

    const element = document.getElementById(props.pathname);
    if (element) {
      element.addEventListener("dragover", handleDragOver);
      element.addEventListener("drop", handleDrop);
      element.addEventListener("dragleave", handleDragLeave);
    }

    return () => {
      if (element) {
        element.removeEventListener("dragover", handleDragOver);
        element.removeEventListener("drop", handleDrop);
        element.removeEventListener("dragleave", handleDragLeave);
      }
    };
  }, [onExternalDrop]);

  // if (!isEnabled) {
  //   return <div>{children}</div>;
  // }

  return (
    <div id={props.pathname}>
      <DraggableDropTargetItem
        isEnabled={isEnabled}
        externalHover={externalHover}
        {...props}
      >
        {children}
      </DraggableDropTargetItem>
    </div>
  );
};

export default DraggableAndDroppable;