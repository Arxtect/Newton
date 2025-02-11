import { createProject, addShareRoom } from "@/services";
import { createProjectInfo, mkdir } from "domain/filesystem";

export const createProjectService = async (
  project_name,
  room_name,
  user,
  is_sync = false
) => {
  try {
    const share_link = `${window.location.origin}/#/project?project=${project_name}&&roomId=${user.id}`;
    const response = await createProject(
      project_name,
      share_link,
      room_name,
      user.email,
      is_sync
    );
    return response;
  } catch (error) {
    throw error;
  }
};

export const initProject = async (projectName, user) => {
  const roomName = projectName + user.id;
  const res = await createProjectService(projectName, roomName, user);
  const addRoomRes = await addShareRoom({
    project_name: roomName,
  });
  console.log(res, projectName, "projectInfo");
  await mkdir(projectName);
  await createProjectInfo(projectName, {
    name: "YOU",
    ...user,
    ...res,
    project_id: res?.id,
    is_sync: false,
  });
};
