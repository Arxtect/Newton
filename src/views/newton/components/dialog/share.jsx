/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-06 21:26:51
 */
import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

import ArDialog from "@/components/arDialog";
import { toast } from "react-toastify";
import { ProjectSync } from "@/convergence";
import { getProjectInfo, createProjectInfo } from "domain/filesystem";
import { updateDialogLoginOpen, useUserStore, useFileStore } from "@/store";

import ArIcon from "@/components/arIcon";

import { getYDocToken } from "services";
import ShareProject from "@/features/share";
import {
  inviteUser,
  deleteInviteUser,
  closeRoom,
  getRoomInfoList,
  getRoomUserAccess,
  reopenRoom,
} from "@/services";
import { useCopyToClipboard } from "@/useHooks";
import Tooltip from "@/components/tooltip";

const Share = forwardRef(({ rootPath, user }, ref) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copyToClipboard] = useCopyToClipboard();

  const controlShare = async () => {
    const info = await getProjectInfo(rootPath);
    if (info.userId && info.userId != user.id) {
      await copyToClipboard(
        link,
        "You didn't have permission to share, link copied to clipboard",
        "info"
      );
      return;
    }
    if (!user || JSON.stringify(user) === "{}") {
      toast.warning("Please login");
      updateDialogLoginOpen(true);
      return;
    }
    setDialogOpen(true);
  };

  useImperativeHandle(ref, () => ({
    controlShare,
  }));

  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState("");

  const { updateProjectSync, filepath, loadFile, leaveProjectSyncRoom } =
    useFileStore((state) => ({
      updateProjectSync: state.updateProjectSync,
      filepath: state.filepath,
      loadFile: state.loadFile,
      leaveProjectSyncRoom: state.leaveProjectSyncRoom,
    }));

  useEffect(() => {
    if (!rootPath || !user || JSON.stringify(user) === "{}") return;
    const generatedLink = `${window.location.origin}/project#/project?project=${rootPath}&&roomId=${user.id}`;
    setLink(generatedLink);
  }, [user, rootPath]);

  const handleCancelProject = () => {
    setDialogOpen(false);
  };
  const getYDocTokenReq = async () => {
    const token = await getYDocToken();
    console.log(token, "token");
    return token;
  };

  const createProjectSync = async (rootPath, user) => {
    const token = await getYDocTokenReq();
    const projectSync = new ProjectSync(rootPath, user, user.id, token);
    updateProjectSync(projectSync);
    await projectSync.syncFolderToYMapRootPath();
    // await projectSync.setObserveHandler();
    setTimeout(() => {
      filepath && loadFile({ filepath: filepath });
    }, [500]);
  };

  const copyLink = async () => {
    await copyToClipboard(
      link,
      "Link copied to clipboard!",
      "success",
      document.getElementById("ar-dialog")
    );
    // handleSaveProject();
  };

  const handleSaveProject = async () => {
    let projectInfo = await getProjectInfo(rootPath);
    //  if (projectInfo?.isSync || projectInfo?.isClose) return;
    setLoading(true);
    try {
      // 创建 ProjectSync 实例
      await createProjectSync(rootPath, user);
      setLoading(false);
      // handleCancelProject();
    } catch (error) {
      toast.error("Share failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (searchInput, access) => {
    console.log(searchInput, access, "searchInput");
    let res = await inviteUser({
      email: searchInput,
      share_link: link,
      project_name: rootPath + user.id,
      access: access,
    });
    if (res?.status == "success") {
      toast.success(`Invite ${searchInput} success`);
      getRoomInfo();
      handleSaveProject();
    }
    return res?.status;
  };

  const handleRemoveUser = async (email) => {
    let res = await deleteInviteUser({
      email: email,
      project_name: rootPath + user.id,
    });
    if (res?.status == "success") {
      getRoomInfo();
      toast.success(`Remove user success`);
    }
    return res?.status;
  };

  const handleCloseRoom = async () => {
    let res = await closeRoom({
      project_name: rootPath + user.id,
    });
    if (res?.status == "success") {
      toast.success(`Close room success`);
      getRoomInfo();
    }
    return res?.status;
  };

  const handleUpdateUser = async (searchInput, access) => {
    let res = await inviteUser({
      email: searchInput,
      share_link: link,
      project_name: rootPath + user.id,
      access: access,
    });
    if (res?.status == "success") {
      getRoomInfo();
      toast.success(`Change user access success`);
    }
    return res?.status;
  };
  const handleReopenRoom = async () => {
    let res = await reopenRoom({
      project_name: rootPath + user.id,
    });
    if (res?.status == "success") {
      await getRoomInfo();
      handleSaveProject();
      toast.success(`Reopen room success`);
    }
    return res?.status;
  };

  const [roomInfo, setRoomInfo] = useState({});

  const getRoomInfo = async () => {
    let projectInfo = await getProjectInfo(rootPath);
    let res = await getRoomInfoList({
      project_name: rootPath + user.id,
    });
    const roomInfo = res?.data?.room;
    if (roomInfo?.is_closed) {
      await createProjectInfo(rootPath, {
        ...projectInfo,
        isSync: false,
        isClose: true,
      });
      leaveProjectSyncRoom();
    } else {
      await createProjectInfo(rootPath, {
        ...projectInfo,
        isClose: false,
      });
    }
    setRoomInfo(roomInfo);
    const info = await getProjectInfo(rootPath);
    console.log(info, "info");
  };

  useEffect(() => {
    dialogOpen && getRoomInfo();
  }, [dialogOpen]);

  return (
    <React.Fragment>
      <Tooltip content="Share Your Project" position="bottom">
        <button
          className={`flex items-center justify-end text-gray-700 px-2 py-1 hover:bg-gray-200 active:bg-arx-theme-hover space-x-1`}
          onClick={() => {
            controlShare();
          }}
        >
          <ArIcon
            name={"Share"}
            loading="lazy"
            className="w-[1.1rem] h-[1.1rem] text-black"
          />
          <span className="font-arx">Share</span>
        </button>
      </Tooltip>
      <ArDialog
        title={
          <div className="flex justify-between mr-8 w-full" id="ar-dialog">
            {"Share Project"}
            <div
              className="flex items-center gap-2.5 text-sm  cursor-pointer"
              onClick={() => copyLink()}
            >
              <ArIcon
                name={"Link"}
                loading="lazy"
                className="object-contain shrink-0 w-6 aspect-square text-arxTheme"
              />
              <span className="text-arxTheme">Copy Link</span>
            </div>
          </div>
        }
        dialogOpen={dialogOpen}
        handleCancel={handleCancelProject}
        buttonList={[{ title: "Cancel", click: handleCancelProject }]}
        width={"50vw"}
      >
        <ShareProject
          handleInvite={handleInvite}
          handleUpdateUser={handleUpdateUser}
          roomInfo={roomInfo}
          getRoomInfo={getRoomInfo}
          user={user}
          handleRemoveUser={handleRemoveUser}
          handleCloseRoom={handleCloseRoom}
          handleReopenRoom={handleReopenRoom}
        ></ShareProject>
      </ArDialog>
    </React.Fragment>
  );
});

export default Share;
