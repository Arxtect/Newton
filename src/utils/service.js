import { createProject } from "@/services";

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
