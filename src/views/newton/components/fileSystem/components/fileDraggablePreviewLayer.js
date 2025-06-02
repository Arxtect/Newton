import zIndex from "@mui/material/styles/zIndex";
import { useRef } from "react";

// A custom component rendered on top of a draggable area that renders the
// dragged item. See
// https://react-dnd.github.io/react-dnd/examples/drag-around/custom-drag-layer
// for more details.
// Also used to display a container border when hovered.
function FileTreeDraggablePreviewLayer({
  isOver,
  isDragging,
  item,
  clientOffset,
}) {
  const ref = useRef();

  return (
    <div
      ref={ref}
      className={`absolute inset-0 overflow-hidden pointer-events-none z-[9999] ${
        isOver ? "border border-blue-500" : ""
      }`}
    >
      {isDragging && item?.title && (
        <div
          style={getItemStyle(
            clientOffset,
            ref.current?.getBoundingClientRect()
          )}
        >
          <DraggablePreviewItem title={item.title} />
        </div>
      )}
    </div>
  );
}

function DraggablePreviewItem({ title }) {
  return (
    <div className="flex justify-center bg-[#81c784] w-3/4 overflow-hidden text-ellipsis whitespace-nowrap;">
      {title}
    </div>
  );
}

// Makes the preview item follow the cursor.
// See https://react-dnd.github.io/react-dnd/docs/api/drag-layer-monitor
function getItemStyle(clientOffset, containerOffset) {
  if (!containerOffset || !clientOffset) {
    return {
      display: "none",
    };
  }
  const { x: containerX, y: containerY } = containerOffset;
  const { x: clientX, y: clientY } = clientOffset;
  const posX = clientX - containerX - 15;
  const posY = clientY - containerY - 15;
  const transform = `translate(${posX}px, ${posY}px)`;
  return {
    transform,
    WebkitTransform: transform,
  };
}

export default FileTreeDraggablePreviewLayer;
