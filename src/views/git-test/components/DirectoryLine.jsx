import React, { useState, useEffect, useRef } from "react";
import path from "path";
import { Icon, Tooltip } from "@blueprintjs/core";
import { ContextMenuProvider } from "react-contexify";
import range from "lodash/range";

import AddDir from "./AddDir";
import AddFile from "./AddFile";
import Draggable from "./Draggable";
import FileLine from "./FileLine";
import Pathname from "./Pathname";
import SortableTree from "react-sortable-tree";
import FileExplorerTheme from "react-sortable-tree-theme-file-explorer";
import { List, ListItem, ListItemText, ListItemIcon } from "@mui/material";
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  InsertDriveFile as FileIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";

import { readFileStats } from "../../../domain/filesystem/queries/readFileStats";

// const DirectoryLineContent = ({
//   dirpath,
//   depth,
//   root,
//   open = false,
//   touchCounter,
//   isFileCreating,
//   isDirCreating,
//   fileMoved,
//   startFileCreating,
//   startDirCreating,
//   deleteDirectory,
//   editingFilepath,
//   ignoreGit: p_ignoreGit,
//   loadFile,
// }) => {
//   const [opened, setOpened] = useState(open);
//   const [fileList, setFileList] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [hovered, setHovered] = useState(false);

//   useEffect(() => {
//     let unmounted = false;
//     console.log(loading, "loading", opened);
//     const updateChildren = async () => {
//       try {
//         const fileList = await readFileStats(root, dirpath);
//         console.log(fileList, "fileList");
//         if (!unmounted) {
//           setFileList(fileList);
//           setLoading(false);
//         }
//       } catch (error) {
//         console.log(error, "error loading");
//         if (!unmounted) {
//           setError(error);
//           setLoading(false);
//         }
//       }
//     };

//     if (opened) {
//       updateChildren();
//     }

//     return () => {
//       unmounted = true;
//     };
//   }, [dirpath, root, opened, touchCounter]);

//   // Function to handle mouse over event
//   const handleMouseOver = () => setHovered(true);

//   // Function to handle mouse leave event
//   const handleMouseLeave = () => setHovered(false);

//   // Function to handle click event and toggle directory open/close
//   const handleClick = (e) => {
//     // e.preventDefault();
//     if (!loading) {
//       setOpened(!opened);
//     }
//   };

//   // Function to handle file move
//   const handleFileMove = (result) => {
//     if (result) {
//       fileMoved(result);
//     }
//   };

//   // Function to handle directory delete
//   const handleDeleteDirectory = (event, dirpath) => {
//     event.stopPropagation();
//     if (window.confirm(`Confirm: delete ${dirpath}`)) {
//       deleteDirectory({ dirpath });
//     }
//   };
//   const relpath = path.relative(root, dirpath);
//   const basename = path.basename(relpath);
//   const ignoreGit = relpath === ".git" || p_ignoreGit || false;

//   return (
//     <>
//       <ContextMenuProvider id="directory" data={{ dirpath }} component="span">
//         <div
//           onMouseOver={handleMouseOver}
//           onMouseLeave={handleMouseLeave}
//           onClick={handleClick}
//         >
//           <Draggable
//             pathname={dirpath}
//             type="dir"
//             onDrop={handleFileMove}
//             onDropByOther={() => setOpened(true)}
//           >
//             <div style={{ display: "flex", flexDirection: "row" }}>
//               <div style={{ flex: 1 }} className="flex">
//                 {/* Replace Prefix and Pathname with your actual implementation */}
//                 <Prefix depth={depth} />
//                 {opened ? (
//                   <Icon icon="folder-open" />
//                 ) : (
//                   <Icon icon="folder-close" />
//                 )}
//                 &nbsp;
//                 <Pathname ignoreGit={ignoreGit}>
//                   {basename || `${dirpath}`}
//                 </Pathname>
//               </div>
//               {hovered && (
//                 <HoveredMenu
//                   root={root}
//                   basename={basename}
//                   dirpath={dirpath}
//                   onClickFile={(event) => {
//                     event.stopPropagation();
//                     setOpened(true);
//                     startFileCreating(dirpath);
//                   }}
//                   onClickDir={(event) => {
//                     event.stopPropagation();
//                     setOpened(true);
//                     startDirCreating(dirpath);
//                   }}
//                   onClickRemove={(event) =>
//                     handleDeleteDirectory(event, dirpath)
//                   }
//                 />
//               )}
//             </div>
//           </Draggable>
//           {opened && (
//             <>
//               {isFileCreating && (
//                 <div>
//                   <Prefix depth={depth + 1} />
//                   <AddFile parentDir={dirpath} />
//                 </div>
//               )}
//               {isDirCreating && (
//                 <div>
//                   <Prefix depth={depth + 1} />
//                   <AddDir parentDir={dirpath} />
//                 </div>
//               )}
//             </>
//           )}
//         </div>
//       </ContextMenuProvider>
//       {opened && fileList != null && (
//         <LinkedLines
//           root={root}
//           dirpath={dirpath}
//           depth={depth + 1}
//           fileList={fileList}
//           editingFilepath={editingFilepath}
//           touchCounter={touchCounter}
//           isFileCreating={isFileCreating}
//           isDirCreating={isDirCreating}
//           fileMoved={fileMoved}
//           startFileCreating={startFileCreating}
//           startDirCreating={startDirCreating}
//           deleteDirector={deleteDirectory}
//           ignoreGit={ignoreGit}
//           loadFile={loadFile}
//         />
//       )}
//     </>
//   );
// };

// const DirectoryLine = (props) => {
//   return <DirectoryLineContent {...props} />;
// };

const LinkedLines = ({
  dirpath,
  root,
  depth,
  fileList,
  editingFilepath,
  ...res
}) => {
  return (
    <>
      {fileList.map((f) => {
        const filepath = path.join(dirpath, f.name);
        if (f.type === "file") {
          return (
            <FileLine
              {...res}
              key={f.name}
              depth={depth}
              filepath={filepath}
              ignoreGit={f.ignored}
            />
          );
        } else if (f.type === "dir") {
          return (
            <DirectoryLine
              {...res}
              key={f.name}
              root={root}
              dirpath={filepath}
              depth={depth}
              open={
                editingFilepath != null &&
                !path.relative(filepath, editingFilepath).startsWith("..")
              }
              ignoreGit={f.ignored}
            />
          );
        }
        return null;
      })}
    </>
  );
};

const HoveredMenu = ({
  basename,
  dirpath,
  root,
  onClickFile,
  onClickDir,
  onClickRemove,
}) => (
  <div style={{ minWidth: "30px" }} className="flex">
    {/* <Tooltip content="Create new file" position="top"> */}
    <Icon icon="document" onClick={(event) => onClickFile(event)} />
    {/* </Tooltip> */}

    {/* <Tooltip content="Create new dir" position="top"> */}
    <Icon
      icon="folder-new"
      data-tip
      data-for="new-dir"
      onClick={(event) => onClickDir(event)}
    />
    {/* </Tooltip> */}

    {basename !== ".git" && dirpath !== root && (
      <Tooltip content="Delete" position="top">
        <Icon
          icon="trash"
          data-tip
          data-for="delete"
          onClick={(event) => onClickRemove(event)}
        />
      </Tooltip>
    )}
  </div>
);

const DirectoryLineContent = ({
  dirpath,
  depth,
  root,
  open = false,
  touchCounter,
  isFileCreating,
  isDirCreating,
  fileMoved,
  startFileCreating,
  startDirCreating,
  deleteDirectory,
  editingFilepath,
  ignoreGit: p_ignoreGit,
  loadFile,
  currentSelectDir,
  changeCurrentSelectDir,
}) => {
  const [opened, setOpened] = useState(open);
  const [fileList, setFileList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    let unmounted = false;

    const updateChildren = async () => {
      try {
        const fileList = await readFileStats(root, dirpath);

        if (!unmounted) {
          setFileList(fileList);
          setLoading(false);
        }
      } catch (error) {
        if (!unmounted) {
          setError(error);
          setLoading(false);
        }
      }
    };

    updateChildren();

    return () => {
      unmounted = true;
    };
  }, [dirpath, root, opened, touchCounter]);

  const handleMouseOver = () => setHovered(true);

  const handleMouseLeave = () => setHovered(false);

  const handleClick = (e, dirpath) => {
    if (!loading) {
      setOpened(!opened);
      changeCurrentSelectDir(dirpath);
    }
  };

  const handleFileMove = (result) => {
    if (result) {
      fileMoved(result);
    }
  };

  const handleDeleteDirectory = (event, dirpath) => {
    event.stopPropagation();
    if (window.confirm(`Confirm: delete ${dirpath}`)) {
      deleteDirectory({ dirpath });
    }
  };

  const relpath = path.relative(root, dirpath);
  const basename = path.basename(relpath);
  const ignoreGit = relpath === ".git" || p_ignoreGit || false;

  return (
    <List className="p-2">
      <ListItem
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => handleClick(e, dirpath)}
        className={`hover:bg-gray-100 transition duration-300 ${
          hovered || currentSelectDir == dirpath ? "bg-gray-100" : ""
        }`}
        style={{ padding: "0px", paddingLeft: `${depth * 8}px` }}
      >
        {fileList && fileList.length > 0 && (
          <ListItemIcon style={{ minWidth: "unset" }}>
            {opened ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </ListItemIcon>
        )}
        <ListItemIcon style={{ minWidth: "unset" }}>
          {opened ? <FolderOpenIcon /> : <FolderIcon />}
        </ListItemIcon>
        <Pathname ignoreGit={ignoreGit}>{basename || `${dirpath}`}</Pathname>
      </ListItem>

      {opened && fileList != null && (
        <LinkedLines
          root={root}
          dirpath={dirpath}
          depth={depth + 1}
          fileList={fileList}
          editingFilepath={editingFilepath}
          touchCounter={touchCounter}
          isFileCreating={isFileCreating}
          isDirCreating={isDirCreating}
          fileMoved={fileMoved}
          startFileCreating={startFileCreating}
          startDirCreating={startDirCreating}
          deleteDirectory={deleteDirectory}
          ignoreGit={ignoreGit}
          loadFile={loadFile}
          currentSelectDir={currentSelectDir}
          changeCurrentSelectDir={changeCurrentSelectDir}
        />
      )}
    </List>
  );
};

const DirectoryLine = (props) => {
  return <DirectoryLineContent {...props} />;
};
export default DirectoryLine;
