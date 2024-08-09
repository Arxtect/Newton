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
import ShareProject from "@/features/share";
import { inviteUser } from "@/services";


const Share = ({
  dialogOpen,
  setDialogOpen,
  rootPath,
  user,
  getProjectList,
}) => {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState("");

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


    const copyLink = async (link) => {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard!");
    };
  
   const handleInvite = async (searchInput, access) => {
     console.log(searchInput, access, "searchInput");
     let status = await inviteUser({
       email: searchInput,
       share_link: link,
       project_name: rootPath + user.id,
       access: access,
     });
     if (status == "success") {
       toast.success(`Invite ${searchInput} success`);
       handleSaveProject();
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
  
  const getRoomInfo = () => {
    //rootPath+user.id
    let roomName = rootPath + user.id;
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
  };

    useEffect(() => {
      getRoomInfo();
    }, []);

  return (
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
  );
};

export default Share;
