import React, { useState, useEffect, useRef } from "react";
import fs from "fs";
import path from "path";
import pify from "pify";
import range from "lodash/range";

import AddDir from "./AddDir";
import AddFile from "./AddFile";
import Draggable from "./Draggable";
import FileLine from "./FileLine";
import Pathname from "./Pathname";
import HoverMenu from "./HoverMenu";
import { List, ListItem, ListItemText, ListItemIcon } from "@mui/material";
import {
  Folder as FolderIcon,
  FolderOpen as FolderOpenIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import FileIcon from "@mui/icons-material/InsertDriveFile";
import { Box, TextField } from "@mui/material";

import { readFileStats } from "domain/filesystem";
import folderOpenSvg from "@/assets/layout/folderOpen.svg";
import folderCloseSvg from "@/assets/layout/folderClose.svg";


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
  renamingPathname,
  startRenaming,
  endRenaming,
  preRenamingDirpath,
  changePreRenamingDirpath,
  changeCurrentProjectRoot,
}) => {
  const [opened, setOpened] = useState(
    preRenamingDirpath == dirpath ? true : open
  );
  const [fileList, setFileList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    let unmounted = false;

    const updateChildren = async () => {
      try {
        const fileList = await readFileStats(dirpath);

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
    e.stopPropagation();
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

  const [value, setValue] = useState(path.basename(dirpath));
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputRef.current, renamingPathname]);

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleBlur = () => {
    endRenaming();
  };
  const handleRename = () => {
    startRenaming({ pathname: dirpath });
  };

  const handleKeyDown = (ev) => {
    if (ev.key === "Escape") {
      endRenaming();
    } else if (ev.key === "Enter") {
      if (!value || value == "") {
        endRenaming();
        return;
      }
      handleDirRenameConfirm(value);
    }
  };
  const handleDirRenameConfirm = async (value) => {
    const parentDir = path.dirname(dirpath);
    const newDirPath = path.join(parentDir, value);
    if (opened) {
      changePreRenamingDirpath({ dirpath: newDirPath });
    }
    try {
      // Rename the directory
      await pify(fs.rename)(dirpath, newDirPath);

      endRenaming();
      fileMoved({ fromPath: dirpath, destPath: newDirPath });
      if (depth == 0) {
        changeCurrentProjectRoot({ projectRoot: newDirPath });
      }
    } catch (error) {
      console.error("Error renaming directory:", error);
    }
  };

  return (
    <List className="p-0">
      <div onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
        <Draggable
          pathname={dirpath}
          type="dir"
          onDrop={handleFileMove}
          onDropByOther={() => setOpened(true)}
        >
          <ListItem
            onMouseOver={handleMouseOver}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => handleClick(e, dirpath)}
            className={`hover:bg-gray-100 transition duration-300 ${hovered || currentSelectDir == dirpath ? "bg-gray-100" : ""
              }`}
            style={{
              padding: "3px 0px 3px 0px",
              paddingLeft: `${depth * 8}px`,
            }}
          >
            <ListItemIcon
              style={{
                minWidth: "unset",
                // visibility:
                //   fileList && fileList.length > 0 ? 'visible' : 'hidden' ,
              }}
            >
              {opened ? <ExpandMoreIcon /> : <ChevronRightIcon />}
            </ListItemIcon>
            <ListItemIcon style={{ minWidth: "unset" }}>
              {/* {opened ? <FolderOpenIcon /> : <FolderIcon />} */}
              {opened ? <img src={folderOpenSvg} alt="" /> : <img src={folderCloseSvg} alt="" />}
            </ListItemIcon>
            {renamingPathname === dirpath ? (
              <TextField
                className="tailwind-classes-for-input"
                variant="outlined"
                size="small"
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                inputRef={inputRef}
                sx={{
                  "& .MuiInputBase-input": {
                    height: "24px",
                    padding: "0 6px",
                  },
                }}
              />
            ) : (
              <React.Fragment>
                <Pathname ignoreGit={ignoreGit}>
                  {basename || `${dirpath}`}
                </Pathname>
                {hovered && (
                  <HoverMenu
                    basename={basename}
                    dirpath={basename}
                    root={basename}
                    onAddFile={(event) => {
                      setOpened(true);
                      startFileCreating(dirpath);
                    }}
                    onAddFolder={(event) => {
                      setOpened(true);
                      startDirCreating(dirpath);
                    }}
                    onDelete={(event) => {
                      handleDeleteDirectory(event, dirpath);
                    }}
                    onRename={(event) => {
                      handleRename(event);
                    }}
                    depth={depth}
                  />
                )}
              </React.Fragment>
            )}
          </ListItem>
        </Draggable>
      </div>
      {opened && (
        <>
          {isFileCreating == dirpath && (
            <div>
              <AddFile parentDir={dirpath} depth={depth} />
            </div>
          )}
          {isDirCreating == dirpath && (
            <div>
              <AddDir parentDir={dirpath} depth={depth} />
            </div>
          )}
        </>
      )}
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
          renamingPathname={renamingPathname}
          startRenaming={startRenaming}
          endRenaming={endRenaming}
          preRenamingDirpath={preRenamingDirpath}
          changePreRenamingDirpath={changePreRenamingDirpath}
          changeCurrentProjectRoot={changeCurrentProjectRoot}
        />
      )}
    </List>
  );
};

const DirectoryLine = (props) => {
  return <DirectoryLineContent {...props} />;
};

export default DirectoryLine;
