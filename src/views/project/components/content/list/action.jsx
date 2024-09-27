/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-07-30 15:02:25
 */
import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { IconButton } from "@mui/material";
import Tooltip from "@/components/tooltip";

import { downloadDirectoryAsZip, createProjectInfo } from "domain/filesystem";
import { toast } from "react-toastify";
import { useFileStore } from "@/store";
import ArIcon from "@/components/arIcon";
import { useAuthCallback } from "@/useHooks";

const HoverAction = forwardRef(
  ({ item, getProjectList, handleGithub, user, ...props }, ref) => {
    const authCallback = useAuthCallback();

    const {
      handleCopy,
      handleRename,
      controlShare,
      setIsGitDelete,
      setIsTrashDelete,
      handleDeleteProject,
    } = props;

    const { getCurrentProjectPdf } = useFileStore((state) => ({
      getCurrentProjectPdf: state.getCurrentProjectPdf,
    }));

    const restoreProject = async (rootName) => {
      await createProjectInfo(rootName, {
        isClosed: false,
      });

      getProjectList();
    };

    // download pdf
    const downloadPdf = async (projectName) => {
      const blobUrl = await getCurrentProjectPdf(projectName);
      console.log(blobUrl, "blobUrl");

      if (!blobUrl) {
        toast.warning("project is not compiled please compile it first");
        return;
      }
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = projectName + ".pdf";
      link.click();
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 30000);
    };

    return (
      <div className="flex items-center w-full justify-center">
        {item?.type == "git" ? (
          <React.Fragment>
            <Tooltip content="Import" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleGithub(true, item.title);
                }}
              >
                <ArIcon name={"GitCloud"} className="text-black w-4 h-4" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Delete" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(item.title);
                  setIsGitDelete(true);
                  setIsTrashDelete(false);
                }}
              >
                <ArIcon name={"Delete"} className="text-black w-4 h-4" />
              </IconButton>
            </Tooltip>
          </React.Fragment>
        ) : item?.isClosed ? (
          <React.Fragment>
            <Tooltip content="Restore" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  restoreProject(item.title);
                }}
              >
                <ArIcon name={"Restore"} className="text-black w-4 h-4" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Delete" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteProject(item.title);
                  setIsTrashDelete(true);
                  setIsGitDelete(false);
                }}
              >
                <ArIcon name={"Delete"} className="text-black  w-4 h-4" />
              </IconButton>
            </Tooltip>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Tooltip content="Download" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();

                  authCallback(() => {
                    downloadDirectoryAsZip(item.title);
                  });
                }}
              >
                <ArIcon
                  name={"DownloadProject"}
                  className="text-black w-4 h-4"
                />
              </IconButton>
            </Tooltip>
            <Tooltip content="Copy" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  authCallback(() => {
                    handleCopy(item.title);
                  });
                }}
              >
                <ArIcon name={"Copy"} className="text-black" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Download PDF" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();

                  authCallback(() => {
                    downloadPdf(item.title);
                  });
                }}
              >
                <ArIcon name={"DownloadPdf"} className="text-black" />
              </IconButton>
            </Tooltip>
            <Tooltip content="SHARE" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.userId && item.userId != user.id) {
                    toast.warning(
                      "this project is shared, You didn't have permission to share"
                    );
                    return;
                  }

                  authCallback(() => {
                    controlShare(item.title);
                  });
                }}
              >
                <ArIcon name={"Share"} className="text-black w-4 h-4" />
              </IconButton>
            </Tooltip>
            <Tooltip content="Trash" position="bottom">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsGitDelete(false);
                  setIsTrashDelete(false);
                  authCallback(() => {
                    handleDeleteProject(item.title);
                  });
                }}
              >
                <ArIcon name={"Delete"} className="text-black" />
              </IconButton>
            </Tooltip>
          </React.Fragment>
        )}
      </div>
    );
  }
);

export default React.memo(HoverAction);
