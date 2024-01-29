import React, { useState, useEffect, useRef } from 'react';
import path from 'path';
import { Icon, Tooltip } from "@blueprintjs/core";
import { ContextMenuProvider } from "react-contexify";
import range from "lodash/range"

import AddDir from "./AddDir"
import AddFile from "./AddFile"
import Draggable from "./Draggable"
import FileLine from "./FileLine"
import Pathname from "./Pathname"
import SortableTree from 'react-sortable-tree';
import FileExplorerTheme from 'react-sortable-tree-theme-file-explorer';

import { readFileStats } from "../../../domain/filesystem/queries/readFileStats"

// const DirectoryLineContent = ({
//     dirpath,
//     depth,
//     root,
//     open = false,
//     touchCounter,
//     isFileCreating,
//     isDirCreating,
//     fileMoved,
//     startFileCreating,
//     startDirCreating,
//     deleteDirectory,
//     editingFilepath,
//     ignoreGit: p_ignoreGit,
//     loadFile
// }) => {
//     const [opened, setOpened] = useState(open);
//     const [fileList, setFileList] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [hovered, setHovered] = useState(false);

//     useEffect(() => {

//         let unmounted = false;
//         console.log(loading, 'loading', opened)
//         const updateChildren = async () => {
//             try {
//                 const fileList = await readFileStats(root, dirpath)
//                 console.log(fileList, 'fileList')
//                 if (!unmounted) {
//                     setFileList(fileList);
//                     setLoading(false);
//                 }
//             } catch (error) {
//                 console.log(error, 'error loading')
//                 if (!unmounted) {
//                     setError(error);
//                     setLoading(false);
//                 }
//             }
//         };

//         if (opened) {
//             updateChildren();
//         }

//         return () => {
//             unmounted = true;
//         };
//     }, [dirpath, root, opened, touchCounter]);

//     // Function to handle mouse over event
//     const handleMouseOver = () => setHovered(true);

//     // Function to handle mouse leave event
//     const handleMouseLeave = () => setHovered(false);

//     // Function to handle click event and toggle directory open/close
//     const handleClick = (e) => {
//         // e.preventDefault();
//         if (!loading) {
//             setOpened(!opened);
//         }
//     };

//     // Function to handle file move
//     const handleFileMove = (result) => {
//         if (result) {
//             fileMoved(result);
//         }
//     };

//     // Function to handle directory delete
//     const handleDeleteDirectory = (event, dirpath) => {
//         event.stopPropagation();
//         if (window.confirm(`Confirm: delete ${dirpath}`)) {
//             deleteDirectory({ dirpath });
//         }
//     };
//     const relpath = path.relative(root, dirpath);
//     const basename = path.basename(relpath);
//     const ignoreGit = relpath === ".git" || p_ignoreGit || false;

//     return (
//         <>
//             <ContextMenuProvider id="directory" data={{ dirpath }} component="span">
//                 <div
//                     onMouseOver={handleMouseOver}
//                     onMouseLeave={handleMouseLeave}
//                     onClick={handleClick}
//                 >
//                     <Draggable
//                         pathname={dirpath}
//                         type="dir"
//                         onDrop={handleFileMove}
//                         onDropByOther={() => setOpened(true)}
//                     >
//                         <div style={{ display: "flex", flexDirection: "row" }}>
//                             <div style={{ flex: 1 }} className="flex">
//                                 {/* Replace Prefix and Pathname with your actual implementation */}
//                                 <Prefix depth={depth} />
//                                 {opened ? (
//                                     <Icon icon="folder-open" />
//                                 ) : (
//                                     <Icon icon="folder-close" />
//                                 )}
//                                 &nbsp;
//                                 <Pathname ignoreGit={ignoreGit}>
//                                     {basename || `${dirpath}`}
//                                 </Pathname>
//                             </div>
//                             {hovered && (
//                                 <HoveredMenu
//                                     root={root}
//                                     basename={basename}
//                                     dirpath={dirpath}
//                                     onClickFile={(event) => {
//                                         event.stopPropagation();
//                                         setOpened(true);
//                                         startFileCreating(dirpath);
//                                     }}
//                                     onClickDir={(event) => {
//                                         event.stopPropagation();
//                                         setOpened(true);
//                                         startDirCreating(dirpath);
//                                     }}
//                                     onClickRemove={(event) => handleDeleteDirectory(event, dirpath)}
//                                 />
//                             )}
//                         </div>
//                     </Draggable>
//                     {opened && (
//                         <>
//                             {isFileCreating && (
//                                 <div>
//                                     <Prefix depth={depth + 1} />
//                                     <AddFile parentDir={dirpath} />
//                                 </div>
//                             )}
//                             {isDirCreating && (
//                                 <div>
//                                     <Prefix depth={depth + 1} />
//                                     <AddDir parentDir={dirpath} />
//                                 </div>
//                             )}
//                         </>
//                     )}
//                 </div>
//             </ContextMenuProvider>
//             {opened && fileList != null && (
//                 <LinkedLines
//                     root={root}
//                     dirpath={dirpath}
//                     depth={depth + 1}
//                     fileList={fileList}
//                     editingFilepath={editingFilepath}
//                     touchCounter={touchCounter}
//                     isFileCreating={isFileCreating}
//                     isDirCreating={isDirCreating}
//                     fileMoved={fileMoved}
//                     startFileCreating={startFileCreating}
//                     startDirCreating={startDirCreating}
//                     deleteDirector={deleteDirectory}
//                     ignoreGit={ignoreGit}
//                     loadFile={loadFile}
//                 />
//             )}
//         </>
//     );
// };
const DirectoryLine = ({
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
    loadFile
}) => {
    const [treeData, setTreeData] = useState([]);
    const [opened, setOpened] = useState(open);
    const [loading, setLoading] = useState(true);

    // 将文件列表转换为树形数据结构
    const formatTreeData = (fileList, dirpath) => {
        return fileList.map(file => ({
            title: file.name,
            isDirectory: file.type === 'dir',
            children: file.type === 'dir' ? [] : null,
            path: path.join(dirpath, file.name),
        }));
    };


    const handleClick = (e) => {
        if (!loading) {
            setOpened(!opened);
        }
    };

    useEffect(() => {
        let isMounted = true
        const loadInitialDirectory = async () => {
            try {

                const fileList = await readFileStats(root, dirpath);
                console.log(fileList, isMounted.current, 'fileList')
                if (isMounted) {
                    setTreeData(formatTreeData(fileList, dirpath));
                    setLoading(false);
                }
            } catch (error) {
                console.log(error, 'error')
                if (isMounted) {
                    setLoading(false);
                    console.error('Error loading directory:', error);
                }
            }
        };

        if (opened) {
            loadInitialDirectory();
        }

        return () => {
            isMounted.current = false;
        };
    }, [dirpath, root, opened, touchCounter]);

    useEffect(() => {
        console.log(treeData, 'treeData')
    }, [treeData])

    return (
        (opened && treeData.length > 0) ? <SortableTree
            treeData={treeData}
            onChange={newTreeData => setTreeData(newTreeData)}
            theme={FileExplorerTheme}
        /> : <div />
    );
};



// const LinkedLines = ({ dirpath, root, depth, fileList, editingFilepath, ...res }) => {
//     console.log(fileList, 'fileList')
//     return (
//         <>
//             {fileList.map((f) => {
//                 const filepath = path.join(dirpath, f.name);
//                 if (f.type === "file") {
//                     return (
//                         <FileLine
//                             {...res}
//                             key={f.name}
//                             depth={depth}
//                             filepath={filepath}
//                             ignoreGit={f.ignored}
//                         />
//                     );
//                 } else if (f.type === "dir") {
//                     return (
//                         <DirectoryLine
//                             {...res}
//                             key={f.name}
//                             root={root}
//                             dirpath={filepath}
//                             depth={depth}
//                             open={
//                                 editingFilepath != null &&
//                                 !path.relative(filepath, editingFilepath).startsWith("..")
//                             }
//                             ignoreGit={f.ignored}
//                         />
//                     );
//                 }
//                 return null;
//             })}
//         </>
//     );
// }

// const HoveredMenu = ({
//     basename,
//     dirpath,
//     root,
//     onClickFile,
//     onClickDir,
//     onClickRemove
// }) => (
//     <div style={{ minWidth: "30px" }} className="flex">
//         {/* <Tooltip content="Create new file" position="top"> */}
//         <Icon
//             icon="document"
//             onClick={(event) => onClickFile(event)}
//         />
//         {/* </Tooltip> */}

//         {/* <Tooltip content="Create new dir" position="top"> */}
//         <Icon
//             icon="folder-new"
//             data-tip
//             data-for="new-dir"
//             onClick={(event) => onClickDir(event)}
//         />
//         {/* </Tooltip> */}

//         {basename !== ".git" && dirpath !== root && (
//             <Tooltip content="Delete" position="top">
//                 <Icon
//                     icon="trash"
//                     data-tip
//                     data-for="delete"
//                     onClick={(event) => onClickRemove(event)}
//                 />
//             </Tooltip>
//         )}
//     </div>
// );

// const Prefix = ({ depth }) => (
//     <>
//         {range(depth).map((_, k) => (
//             <span key={k}>&nbsp;</span>
//         ))}
//     </>
// )

export default DirectoryLine;
