/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-11-14 12:44:41
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
import { ArLoadingOverlay } from "@/components/arLoading";

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
import { waitForCondition } from "@/utils";

const Share = forwardRef(({ rootPath, user }, ref) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copyToClipboard] = useCopyToClipboard();

  const controlShare = async () => {
    const info = await getProjectInfo(rootPath);
    if (info.userId && info.userId != user.id && user.role != "admin") {
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
    const generatedLink = `${window.location.origin}/#/project?project=${rootPath}&&roomId=${user.id}`;
    setLink(generatedLink);
  }, [user, rootPath]);

  const handleCancelProject = () => {
    setDialogOpen(false);
  };
  const getYDocTokenReq = async (room) => {
    const res = await getYDocToken(room);
    return res;
  };

  const createProjectSync = async (rootPath, user) => {
    const { token, position } = await getYDocTokenReq(rootPath + user.id);
    const projectSync = new ProjectSync(
      rootPath,
      user,
      user.id,
      token,
      position
    );

    const callback = async () => {
      await projectSync.setObserveHandler();

      waitForCondition({
        condition: () => projectSync.isInitialSyncComplete,
        onSuccess: () => {
          if (filepath) {
            loadFile({ filepath: filepath });
            setLoading(false);
            console.log("loadFile", projectSync.isInitialSyncComplete);
          }
        },
        onFailure: () => {
          setLoading(false);
          toast.error("Sync failed, please try again.");
        },
        intervalTime: 100,
        maxElapsedTime: 60000,
      });
    };

    await projectSync.syncFolderToYMapRootPath(callback);
    updateProjectSync(projectSync.saveState);
    projectSync.changeIsInitialSyncComplete(); // 标记初始同步完成
    projectSync.changeInitial && projectSync.changeInitial();
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
      // await createProjectSync(rootPath, user);
      // handleCancelProject();
    } catch (error) {
      toast.error("Share failed!");
    } finally {
      setLoading(false);
    }
  };

  const saveProjectSyncInfoToJson = async (user, rootPath, roomId) => {
    const { id, ...otherInfo } = user;
    await createProjectInfo(rootPath, {
      rootPath: rootPath,
      userId: roomId,
      isSync: true,
      isClose: false,
      ...otherInfo,
    });
  };

  const handleInvite = async (searchInput, access) => {
    let projectInfo = await getProjectInfo(rootPath);
    let projectPath = projectInfo?.rootPath ? projectInfo?.rootPath : rootPath;
    let roomId = projectInfo?.userId ? projectInfo?.userId : user.id;
    let roomLink = `${window.location.origin}/#/project?project=${projectPath}&&roomId=${roomId}`;

    let res = await inviteUser({
      email: searchInput,
      share_link: roomLink,
      project_name: projectPath + roomId,
      access: access,
    });
    await saveProjectSyncInfoToJson(user, projectPath, roomId);
    if (res?.status == "success") {
      toast.success(`Invite ${searchInput} success`);
      getRoomInfo();
      !projectInfo?.userId && handleSaveProject();
    }

    return res?.status;
  };

  const handleRemoveUser = async (email) => {
    let projectInfo = await getProjectInfo(rootPath);
    let projectPath = projectInfo?.rootPath ? projectInfo?.rootPath : rootPath;
    let roomId = projectInfo?.userId ? projectInfo?.userId : user.id;
    let res = await deleteInviteUser({
      email: email,
      project_name: projectPath + roomId,
    });
    if (res?.status == "success") {
      getRoomInfo();
      toast.success(`Remove user success`);
    }
    return res?.status;
  };

  const handleCloseRoom = async () => {
    let projectInfo = await getProjectInfo(rootPath);
    let projectPath = projectInfo?.rootPath ? projectInfo?.rootPath : rootPath;
    let roomId = projectInfo?.userId ? projectInfo?.userId : user.id;
    let res = await closeRoom({
      project_name: projectPath + roomId,
    });
    if (res?.status == "success") {
      toast.success(`Close room success`);
      getRoomInfo();
    }
    return res?.status;
  };

  const handleUpdateUser = async (searchInput, access) => {
    let projectInfo = await getProjectInfo(rootPath);
    let projectPath = projectInfo?.rootPath ? projectInfo?.rootPath : rootPath;
    let roomId = projectInfo?.userId ? projectInfo?.userId : user.id;
    let res = await inviteUser({
      email: searchInput,
      share_link: link,
      project_name: projectPath + roomId,
      access: access,
    });
    if (res?.status == "success") {
      getRoomInfo();
      toast.success(`Change user access success`);
    }
    return res?.status;
  };
  const handleReopenRoom = async () => {
    let projectInfo = await getProjectInfo(rootPath);
    let projectPath = projectInfo?.rootPath ? projectInfo?.rootPath : rootPath;
    let roomId = projectInfo?.userId ? projectInfo?.userId : user.id;
    let res = await reopenRoom({
      project_name: projectPath + roomId,
    });
    if (res?.status == "success") {
      await getRoomInfo();
      await handleSaveProject();
      toast.success(`Reopen room success`);
    }
    return res?.status;
  };

  const [roomInfo, setRoomInfo] = useState({});

  const getRoomInfo = async () => {
    let projectInfo = await getProjectInfo(rootPath);
    let projectPath = projectInfo?.rootPath ? projectInfo?.rootPath : rootPath;
    let roomId = projectInfo?.userId ? projectInfo?.userId : user.id;
    let res = await getRoomInfoList({
      project_name: projectPath + roomId,
    });
    const roomInfo = res?.data?.room;
    if (roomInfo?.is_closed) {
      await createProjectInfo(projectPath, {
        ...projectInfo,
        isSync: false,
        isClose: true,
      });
      leaveProjectSyncRoom();
    } else {
      await createProjectInfo(projectPath, {
        ...projectInfo,
        isClose: false,
      });
    }
    setRoomInfo(roomInfo);
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
        <ArLoadingOverlay text="Synchronizing" loading={loading}>
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
        </ArLoadingOverlay>
      </ArDialog>
    </React.Fragment>
  );
});

export default Share;
