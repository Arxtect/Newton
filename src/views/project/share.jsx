/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-06 21:26:51
 */
import React, { useEffect, useState } from "react";
import ArDialog from "@/components/arDialog";
import { TextField, Box } from "@mui/material";
import { toast } from "react-toastify";
import { ProjectSync } from "@/convergence";
import { useFileStore } from "store";
import { getYDocToken } from "services";
import linkSvg from "@/assets/link.svg";
import { getProjectInfo, createProjectInfo } from "domain/filesystem";
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

const Share = ({
  dialogOpen,
  setDialogOpen,
  rootPath,
  user,
  getProjectList,
}) => {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState("");
  const [copyToClipboard] = useCopyToClipboard();


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
    const projectSync = await new ProjectSync(rootPath, user, user.id, token);
    projectSync.syncFolderToYMapRootPath(getProjectList);
  };


  const handleSaveProject = async () => {
    // let projectInfo = await getProjectInfo(rootPath);
    // if (projectInfo?.isSync || projectInfo?.isClose) return;
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

  const copyLink = async () => {
    await copyToClipboard(link, "Link copied to clipboard!","success",document.getElementById("ar-dialog"));
    // handleSaveProject();
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
        let projectInfo = await getProjectInfo(rootPath);
        // if (projectInfo?.isSync) return;
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
        getRoomInfo();
        toast.success(`Reopen room success`);
      }
      return res?.status;
    };

    const [roomInfo, setRoomInfo] = useState({});

    const getRoomInfo = async () => {
      let res = await getRoomInfoList({
        project_name: rootPath + user.id,
      });
      const roomInfo = res?.data?.room;
      if (roomInfo?.is_closed) {
        await createProjectInfo(rootPath, {
          isSync: false,
          isClose: true,
        });
      } else {
        await createProjectInfo(rootPath, {
          isSync: true,
          isClose: false,
        });
      }
      setRoomInfo(roomInfo);
      const info = await getProjectInfo(rootPath);
      console.log(info, "info");
    };

    useEffect(() => {
      dialogOpen&&getRoomInfo();
    }, [dialogOpen]);

  return (
    <ArDialog
      title={
        <div className="flex justify-between mr-8" id="ar-dialog">
          {"Share Project"}
          <div
            className="flex items-center gap-2.5 text-sm  cursor-pointer"
            onClick={() => copyLink()}
          >
            <img
              loading="lazy"
              src={linkSvg}
              className="object-contain shrink-0 w-6 aspect-square"
              alt=""
            />
            <span className="text-[#81C684]">Copy Link</span>
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
  );
};

export default Share;
