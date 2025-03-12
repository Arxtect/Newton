import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import fs from "fs";
import path from "path";
import pify from "pify";
import range from "lodash/range";
import AddDir from "./AddDir";
import AddFile from "./AddFile";
import Draggable from "./Draggable";
import FileLine from "./FileLine";
import { List, ListItem } from "@mui/material";

import { Box, TextField } from "@mui/material";

import { readFileStats, getProjectInfo } from "domain/filesystem";
import { useFileStore } from "store";
import ArIcon from "@/components/arIcon";
import ContextMenu from "@/components/contextMenu";
import { toast } from "react-toastify";
import DirectoryLineWrapper from "./DirectoryLineWrapper";

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
  fileTree,
  parentDir,
}) => {
  const { dirOpen, isDropFileSystem, filepath, projectSync, reload } =
    useFileStore((state) => ({
      dirOpen: state.dirOpen,
      isDropFileSystem: state.isDropFileSystem,
      filepath: state.filepath,
      projectSync: state.projectSync,
      reload: state.repoChanged,
    }));

  const [opened, setOpened] = useState(open);
  const [hovered, setHovered] = useState(false);

  const handleMouseOver = () => setHovered(true);

  const handleMouseLeave = () => setHovered(false);

  const handleClick = (e, dirpath) => {
    e.preventDefault();
    e.stopPropagation();
    setOpened(!opened);
    changeCurrentSelectDir(dirpath);
  };

  const handleFileMove = (result) => {
    console.log(result);
    if (result) {
      fileMoved(result);
    }
  };

  const handleDeleteDirectory = useCallback(
    (event, dirpath) => {
      event.stopPropagation();
      if (window.confirm(`Confirm: delete ${dirpath}`)) {
        deleteDirectory({ dirpath });
      }
    },
    [deleteDirectory]
  );

  const [value, setValue] = useState(path.basename(dirpath));
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && renamingPathname) {
      renameSection(renamingPathname);
    }
  }, [inputRef.current, renamingPathname]);

  const renameSection = (filepath) => {
    setTimeout(() => {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(0, filepath.length);
    }, 0);
  };

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  const handleBlur = () => {
    // endRenaming();
    handleDirRenameConfirm(value);
  };
  const handleRename = useCallback(async () => {
    if (root == dirpath) {
      const projectInfo = await getProjectInfo(root);
      if (!!projectInfo.isSync) {
        toast.warning(
          "This is a shared collaboration project. Renaming is prohibited"
        );
        return;
      }
    }
    startRenaming({ pathname: dirpath });
  }, [startRenaming, dirpath]);

  const handleKeyDown = (ev) => {
    if (ev.key === "Escape") {
      endRenaming();
      setValue(path.basename(dirpath));
    } else if (ev.key === "Enter") {
      handleDirRenameConfirm(value);
    }
  };

  const handleDirRenameConfirm = async (value) => {
    if (!value || value == "") {
      endRenaming();
      return;
    }
    const parentDir = path.dirname(dirpath);
    const newDirPath = path.join(parentDir, value);
    if (opened) {
      changePreRenamingDirpath({ dirpath: newDirPath });
    }
    try {
      // Rename the directory
      await pify(fs.rename)(dirpath, newDirPath);

      endRenaming();
      setValue(path.basename(newDirPath));
      fileMoved({ fromPath: dirpath, destPath: newDirPath, type: "dir" });
      if (depth == 0) {
        changeCurrentProjectRoot({ projectRoot: newDirPath });
      }
    } catch (error) {
      console.error("Error renaming directory:", error);
    }
  };

  //新增 打开文件夹
  useEffect(() => {
    if (!!dirOpen) {
      if (!currentSelectDir) {
        let dir = path.dirname(filepath);
        setOpened(open || dir == dirpath ? true : false);
        return;
      }
      setOpened(open || currentSelectDir == dirpath ? true : false);
    }
  }, [dirOpen]);

  const onAddFile = useCallback(
    (e) => {
      e.stopPropagation();
      setOpened(true);
      startFileCreating(dirpath);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, [0]);
    },
    [startFileCreating, dirpath]
  );

  const onAddFolder = useCallback(
    (e) => {
      e.stopPropagation();
      setOpened(true);
      startDirCreating(dirpath);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, [0]);
    },
    [startDirCreating, dirpath]
  );

  const menuItems = useMemo(() => {
    return [
      {
        label: "Add File",
        command: (e) => {
          setHovered(false);
          onAddFile(e);
        },
        icon: "NewFile",
      },
      {
        label: "Add Folder",
        command: (e) => {
          setHovered(false);
          onAddFolder(e);
        },
        icon: "NewFolder",
      },
      {
        label: "Rename",
        command: async () => {
          setHovered(false);
          handleRename();
        },
        icon: "FileRename",
      },
      depth != 0 && {
        label: "Delete",
        command: (event) => {
          setHovered(false);
          handleDeleteDirectory(event, dirpath);
        },
        icon: "FileDelete",
      },
    ].filter((item) => item?.label);
  }, [
    depth,
    dirpath,
    handleDeleteDirectory,
    handleRename,
    onAddFile,
    onAddFolder,
  ]);

  return (
    <List className="p-0">
      <ContextMenu items={menuItems}>
        <div onMouseOver={handleMouseOver} onMouseLeave={handleMouseLeave}>
          <Draggable
            pathname={dirpath}
            type="dir"
            onDrop={handleFileMove}
            onDropByOther={() => setOpened(true)}
            isEnabled={isDropFileSystem && renamingPathname !== dirpath}
            setHover={() => {
              console.log("setHover");
            }}
            projectSync={projectSync}
            reload={reload}
          >
            <ListItem
              onMouseOver={handleMouseOver}
              onMouseLeave={handleMouseLeave}
              className={`hover:bg-[#bae6bc5c] transition duration-300 ${
                currentSelectDir == dirpath && renamingPathname != dirpath
                  ? "bg-[#81c784]"
                  : ""
              }`}
              style={{
                padding: "4px 0 1px 0",
                paddingLeft: `${depth * 8}px`,
              }}
            >
              <DirectoryLineWrapper
                handleClick={handleClick}
                dirpath={dirpath}
                opened={opened}
                title={`${path.basename(dirpath)}`}
                basename={`${path.basename(dirpath)}`}
                onAddFile={onAddFile}
                onAddFolder={onAddFolder}
                handleDeleteDirectory={handleDeleteDirectory}
                handleRename={handleRename}
                depth={depth}
                menuItems={menuItems}
                hovered={hovered}
              >
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
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#81C784",
                        },
                        "&:hover fieldset": {
                          borderColor: "#81C784",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#81C784",
                        },
                      },
                    }}
                  />
                ) : (
                  <span className="overflow-hidden text-ellipsis">
                    <span>{`${path.basename(dirpath)}`}</span>
                  </span>
                )}
              </DirectoryLineWrapper>
            </ListItem>
          </Draggable>
        </div>
      </ContextMenu>
      {opened && (
        <>
          {isFileCreating == dirpath && (
            <div>
              <AddFile parentDir={dirpath} depth={depth} inputRef={inputRef} />
            </div>
          )}
          {isDirCreating == dirpath && (
            <div>
              <AddDir parentDir={dirpath} depth={depth} inputRef={inputRef} />
            </div>
          )}
        </>
      )}
      {opened &&
        fileTree.length > 0 &&
        fileTree.map((item) => {
          if (item.type === "file") {
            return (
              <FileLine
                key={item.name}
                depth={item.depth}
                filepath={path.join(parentDir, item.filepath)}
                ignoreGit={item.ignored}
                loadFile={loadFile}
                fileMoved={fileMoved}
                startRenaming={startRenaming}
                endRenaming={endRenaming}
                parentDir={parentDir}
              />
            );
          } else if (item.type === "dir") {
            if (item.name === ".git") return null;
            return (
              <DirectoryLine
                key={item.name}
                root={root}
                fileTree={item.children}
                dirpath={path.join(parentDir, item.filepath)}
                depth={item.depth}
                open={
                  editingFilepath != null &&
                  !path
                    .relative(
                      path.join(parentDir, item.filepath),
                      editingFilepath
                    )
                    .startsWith("..")
                }
                touchCounter={touchCounter}
                ignoreGit={item.ignored}
                editingFilepath={editingFilepath}
                isFileCreating={isFileCreating}
                isDirCreating={isDirCreating}
                fileMoved={fileMoved}
                startFileCreating={startFileCreating}
                startDirCreating={startDirCreating}
                deleteDirectory={deleteDirectory}
                loadFile={loadFile}
                currentSelectDir={currentSelectDir}
                changeCurrentSelectDir={changeCurrentSelectDir}
                renamingPathname={renamingPathname}
                startRenaming={startRenaming}
                endRenaming={endRenaming}
                preRenamingDirpath={preRenamingDirpath}
                changePreRenamingDirpath={changePreRenamingDirpath}
                changeCurrentProjectRoot={changeCurrentProjectRoot}
                parentDir={parentDir}
              />
            );
          }
          return null;
        })}
    </List>
  );
};

const DirectoryLine = (props) => {
  return <DirectoryLineContent {...props} />;
};

export default DirectoryLine;
