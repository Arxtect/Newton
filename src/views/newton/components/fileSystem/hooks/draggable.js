import {
  HTML5Backend,
  getEmptyImage,
  NativeTypes,
} from "react-dnd-html5-backend";
import getDroppedFiles from "@uppy/utils/lib/getDroppedFiles";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { useEffect, useState } from "react";

const DRAGGABLE_TYPE = "ENTITY";

export function useDraggable(draggedEntityId) {
  const [isDraggable, setIsDraggable] = useState(true);

  const [, dragRef, preview] = useDrag({
    type: DRAGGABLE_TYPE,
    item() {
      const draggedEntityIds = getDraggedEntityIds(new Set(), draggedEntityId);

      const draggedItems = [];

      return {
        type: DRAGGABLE_TYPE,
        title: getDraggedTitle(draggedItems),
        forbiddenFolderIds: getForbiddenFolderIds(draggedItems),
        draggedEntityIds,
      };
    },
    canDrag() {
      return isDraggable;
    },
    end(item, monitor) {
      if (monitor.didDrop()) {
        const result = monitor.getDropResult();
        if (result) {
          console.log(result.targetEntityId, item.draggedEntityIds); // TODO: use result.dropEffect
        }
      }
    },
  });

  useEffect(() => {
    console.log(draggedEntityId, "draggedEntityId");
  }, [draggedEntityId]);

  // remove the automatic preview as we're using a custom preview via
  // FileTreeDraggablePreviewLayer
  useEffect(() => {
    preview(getEmptyImage());
  }, [preview]);

  return { dragRef, setIsDraggable };
}

export function useDroppable(targetEntityId) {
  const [{ isOver }, dropRef] = useDrop({
    accept: [DRAGGABLE_TYPE, NativeTypes.FILE],
    canDrop(item, monitor) {
      if (!monitor.isOver({ shallow: true })) {
        return false;
      }

      return !(
        item.type === DRAGGABLE_TYPE &&
        item.forbiddenFolderIds.has(targetEntityId)
      );
    },
    drop(item, monitor) {
      console.log(item, monitor, "item, monitor");
      // monitor.didDrop() returns true if the drop was already handled by a nested child
      if (monitor.didDrop()) {
        return;
      }

      // item(s) dragged within the file tree
      if (item.type === DRAGGABLE_TYPE) {
        return { targetEntityId };
      }

      // native file(s) dragged in from outside
      getDroppedFiles(item)
        .then((files) =>
          files.filter((file) => {
            // note: getDroppedFiles normalises webkitRelativePath to relativePath
            return;
            // return isAcceptableFile(file.name, file.relativePath);
          })
        )
        .then((files) => {
          //   setDroppedFiles({ files, targetFolderId: targetEntityId });
          //   startUploadingDocOrFile();
        });
    },
    collect(monitor) {
      return {
        isOver: monitor.canDrop(),
      };
    },
  });

  return { dropRef, isOver };
}

// Get the list of dragged entity ids. If the dragged entity is one of the
// selected entities then all the selected entities are dragged entities,
// otherwise it's the dragged entity only.
function getDraggedEntityIds(selectedEntityIds, draggedEntityId) {
  if (selectedEntityIds.size > 1 && selectedEntityIds.has(draggedEntityId)) {
    // dragging the multi-selected entities
    return new Set(selectedEntityIds);
  } else {
    // not dragging the selection; only the current item
    return new Set([draggedEntityId]);
  }
}

// Get the draggable title. This is the name of the dragged entities if there's
// only one, otherwise it's the number of dragged entities.
function getDraggedTitle(draggedItems) {
  if (draggedItems.size === 1) {
    const draggedItem = Array.from(draggedItems)[0];
    return draggedItem.entity.name;
  }

  return `${draggedItems.size} items`;
}

// Get all children folder ids of any of the dragged items.
function getForbiddenFolderIds(draggedItems) {
  const draggedFoldersArray = Array.from(draggedItems)
    .filter((draggedItem) => draggedItem.type === "folder")
    .map((draggedItem) => draggedItem.entity);
  const draggedFolders = new Set(draggedFoldersArray);
  //   return findAllFolderIdsInFolders(draggedFolders);
}
