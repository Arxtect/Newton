import React, { useEffect, useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import fs from "fs";
import path from "path";
import pify from "pify";
import onExternalDrop from "./uploadFuntion";
import { useFileStore } from "store";


const DND_GROUP = "browser";

async function moveItem(from, to) {
  if (from.pathname === to.pathname) {
    return;
  }
  
  const fromPath = from.pathname;
  const basename = path.basename(from.pathname);
  const destPath = to.type === "dir" 
    ? path.join(to.pathname, basename)
    : path.join(path.dirname(to.pathname), basename);
    
  await pify(fs.rename)(fromPath, destPath);
  return {
    fromPath,
    destPath,
  };
}

const DraggableItem = ({ children, isEnabled, externalHover, ...props }) => {
  // Set up drag functionality
  const {selectedFiles, currentSelectDir} = useFileStore((state) => ({selectedFiles: state.selectedFiles,currentSelectDir: state.currentSelectDir,}));
  const [{ isDragging }, dragRef] = useDrag({
    type: DND_GROUP,
    item: () => {
      console.log("Begin drag:", props);
      return {items: [props]};
      // if (props.type === "dir") {
      //   return { items: [props] };
      // }
      // props.onDrag();
      // const group = props.getGroup();
      // console.log("current group", group);
      // return { items: [...group] };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Set up drop functionality
  const [{ isOver }, dropRef] = useDrop({
    accept: DND_GROUP,
    drop: (dragProps, monitor) => {
      if (monitor) {
        console.log("dragProps", dragProps);
        dragProps.items.forEach((item) => {
          if (props.pathname !== item.pathname) {
            moveItem(item, props).then((result) => {
              props.onDropByOther(result);
              item.onDrop(result);
            });
          }
        });
      }
    },
    hover: (item, monitor) => {
      if (monitor.isOver()) {
        const event = monitor.getClientOffset();
        if (event) {
          console.log("Hover event:", event);
        }
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Combine drag and drop refs
  const ref = useRef(null);
  dragRef(dropRef(ref));

  const opacity = isDragging ? 0.4 : 1;
  const backgroundColor = isOver || externalHover ? "#eaf6ea" : "";
  const dragItemCount = 1;

  return (
    <div
      ref={ref}
      className="drop-target"
      style={{
        opacity: isEnabled ? opacity : 1,
        backgroundColor: isEnabled ? backgroundColor : "",
        pointerEvents: isEnabled ? "auto" : "none",
      }}
    >
      {children}
      {isDragging && (
        <div 
          style={{ 
            position: "absolute", 
            top: 0, 
            right: 0, 
            background: "rgba(255,255,255,0.8)", 
            padding: "2px 5px", 
            borderRadius: "5px" 
          }}
        >
          {dragItemCount} {dragItemCount > 1 ? "items" : "item"} dragging
        </div>
      )}
    </div>
  );
};

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
          props.type === "file" ? path.dirname(props.pathname) : props.pathname,
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
  }, [props.pathname, props.type, projectSync, reload]);

  return (
    <div id={props.pathname}>
      <DraggableItem
        isEnabled={isEnabled}
        externalHover={externalHover}
        {...props}
      >
        {children}
      </DraggableItem>
    </div>
  );
};

export default DraggableAndDroppable;