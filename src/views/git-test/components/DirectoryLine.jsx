import React, { useState, useEffect } from 'react';
import path from 'path';
import { Icon, Tooltip } from "@blueprintjs/core";
import { ContextMenuProvider } from "react-contexify";
import range from "lodash/range"

import AddDir from "./AddDir"
import AddFile from "./AddFile"
import Draggable from "./Draggable"
import FileLine from "./FileLine"
import Pathname from "./Pathname"


import { readFileStats } from "../../../domain/filesystem/queries/readFileStats"


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
    ignoreGit: p_ignoreGit
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
                const fileList = await readFileStats(root, dirpath); // Implement readFileStats or import from your utilities
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

        if (opened) {
            updateChildren();
        }

        return () => {
            unmounted = true;
        };
    }, [dirpath, root, opened, touchCounter]);

    // Function to handle mouse over event
    const handleMouseOver = () => setHovered(true);

    // Function to handle mouse leave event
    const handleMouseLeave = () => setHovered(false);

    // Function to handle click event and toggle directory open/close
    const handleClick = () => {
        if (!loading) {
            setOpened(!opened);
        }
    };

    // Function to handle file move
    const handleFileMove = (result) => {
        if (result) {
            fileMoved(result);
        }
    };

    // Function to handle directory delete
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
        <>
            <ContextMenuProvider id="directory" data={{ dirpath }} component="span">
                <div
                    onMouseOver={handleMouseOver}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleClick}
                >
                    <Draggable
                        pathname={dirpath}
                        type="dir"
                        onDrop={handleFileMove}
                        onDropByOther={() => setOpened(true)}
                    >
                        <div style={{ display: "flex", flexDirection: "row" }}>
                            <div style={{ flex: 1 }}>
                                {/* Replace Prefix and Pathname with your actual implementation */}
                                <Prefix depth={depth} />
                                {opened ? (
                                    <Icon icon="folder-open" />
                                ) : (
                                    <Icon icon="folder-close" />
                                )}
                                &nbsp;
                                <Pathname ignoreGit={ignoreGit}>
                                    {basename || `${dirpath}`}
                                </Pathname>
                            </div>
                            {hovered && (
                                <HoveredMenu
                                    root={root}
                                    basename={basename}
                                    dirpath={dirpath}
                                    onClickFile={(event) => {
                                        event.stopPropagation();
                                        setOpened(true);
                                        startFileCreating({ fileCreatingDir: dirpath });
                                    }}
                                    onClickDir={(event) => {
                                        event.stopPropagation();
                                        setOpened(true);
                                        startDirCreating({ dirCreatingDir: dirpath });
                                    }}
                                    onClickRemove={(event) => handleDeleteDirectory(event, dirpath)}
                                />
                            )}
                        </div>
                    </Draggable>
                    <AddFile parentDir={dirpath} />
                    {opened && (
                        <>
                            {isFileCreating && (
                                <div>
                                    <Prefix depth={depth + 1} />
                                    <AddFile parentDir={dirpath} />
                                </div>
                            )}
                            {isDirCreating && (
                                <div>
                                    <Prefix depth={depth + 1} />
                                    <AddDir parentDir={dirpath} />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </ContextMenuProvider>
            {opened && fileList != null && (
                <LinkedLines
                    root={root}
                    dirpath={dirpath}
                    depth={depth + 1}
                    fileList={fileList}
                    editingFilepath={editingFilepath}
                />
            )}
        </>
    );
};

const DirectoryLine = (props) => {
    // Props should include all necessary data previously provided by the connector
    return <DirectoryLineContent {...props} />;
}

const LinkedLines = ({ dirpath, root, depth, fileList, editingFilepath }) => {
    return (
        <>
            {fileList.map((f) => {
                const filepath = path.join(dirpath, f.name);
                if (f.type === "file") {
                    return (
                        <FileLine
                            key={f.name}
                            depth={depth}
                            filepath={filepath}
                            ignoreGit={f.ignored}
                        />
                    );
                } else if (f.type === "dir") {
                    return (
                        <DirectoryLine
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
}

const HoveredMenu = ({
    basename,
    dirpath,
    root,
    onClickFile,
    onClickDir,
    onClickRemove
}) => (
    <div style={{ minWidth: "30px" }}>
        <Tooltip content="Create new file" position="top">
            <Icon
                icon="document"
                onClick={(event) => onClickFile(event)}
            />
        </Tooltip>

        <Tooltip content="Create new dir" position="top">
            <Icon
                icon="folder-new"
                data-tip
                data-for="new-dir"
                onClick={(event) => onClickDir(event)}
            />
        </Tooltip>

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

const Prefix = ({ depth }) => (
    <>
        {range(depth).map((_, k) => (
            <span key={k}>&nbsp;&nbsp;</span>
        ))}
    </>
)

export default DirectoryLine;
