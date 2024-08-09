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
import { TextField, Box, Tooltip } from "@mui/material";
import { toast } from "react-toastify";
import { ProjectSync } from "@/convergence";
import { getProjectInfo } from "domain/filesystem";
import { updateDialogLoginOpen, useUserStore, useFileStore } from "@/store";
import share from "@/assets/share.svg";
import { getYDocToken } from "services";
import ShareProject from "@/features/share";

import linkSvg from "@/assets/link.svg";
import {inviteUser} from "@/services"

const Share = forwardRef(({ rootPath, user }, ref) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const controlShare = async () => {
    const info = await getProjectInfo(rootPath);
    if (info.userId && info.userId != user.id) {
      await navigator.clipboard.writeText(link);
      toast.warning(
        "You didn't have permission to share, link copied to clipboard"
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

  const { updateProjectSync, filepath, loadFile } = useFileStore((state) => ({
    updateProjectSync: state.updateProjectSync,
    filepath: state.filepath,
    loadFile: state.loadFile,
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
    setTimeout(() => {
      filepath && loadFile({ filepath: filepath });
    }, [500]);
  };


  const copyLink = async (link) => {
    await navigator.clipboard.writeText(link);
     toast.success("Link copied to clipboard!");
  };

  const handleSaveProject = async () => {
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
    console.log(searchInput,access, "searchInput");
   let status =await  inviteUser({
      email: searchInput,
      share_link: link,
      project_name:rootPath+user.id,
      access: access,
   });
    if (status == "success") {
      toast.success(`Invite ${searchInput} success`);
      handleSaveProject()
    }
    return status;
  };

    const handleUpdateUser = async (searchInput, access) => {
      let status = await inviteUser({
        email: searchInput,
        share_link: link,
        project_name: rootPath + user.id,
        access: access,
      });
      if (status == "success") {
        toast.success(`Change user acess success`);
      }
      return status;
    };

  const [roomInfo, setRoomInfo] = useState({});

  const getRoomInfo = () => {  //rootPath+user.id
    let roomName = rootPath+user.id
    const roomInfo = {
      name: roomName,
      create_by: user.id,
      access: "rw",
      share_link: link,
      accessList: [
        {
          ...user,
          access: "rw",
        },
        {
          id: "123",
          name: "ad",
          email: "2473023641@qq.com",
          access: "rw",
        },
      ],
    };
    setRoomInfo(roomInfo); 
  }

  useEffect(() => {
    getRoomInfo()
  }, [])

  return (
    <React.Fragment>
      <Tooltip title="Share Your Project">
        <button
          className={`flex items-center text-gray-700 px-2 py-1 hover:bg-gray-200 active:bg-[#9fd5a2] space-x-1 `}
          onClick={() => {
            controlShare();
          }}
        >
          <img src={share} alt="" className="w-4 h-4" />
          <span>Share</span> {/* 使用空格字符 */}
        </button>
      </Tooltip>
      <ArDialog
        title={
          <div className="flex justify-between mr-8">
            {"Share Project"}
            <div
              className="flex items-center gap-2.5 text-sm  cursor-pointer"
              onClick={() => copyLink(link)}
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
        ></ShareProject>
      </ArDialog>
    </React.Fragment>
  );
});

export default Share;
