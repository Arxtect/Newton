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

const Share = ({
  dialogOpen,
  setDialogOpen,
  rootPath,
  user,
  getProjectList,
}) => {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState("");

  const { projectSync, updateProjectSync } = useFileStore((state) => ({
    projectSync: state.projectSync,
    updateProjectSync: state.updateProjectSync,
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
    const projectSync = await new ProjectSync(rootPath, user, user.id, token);
    projectSync.syncFolderToYMapRootPath(getProjectList);
  };

  const handleSaveProject = async () => {
    setLoading(true);
    try {
      // 创建 ProjectSync 实例
      await createProjectSync(rootPath, user);

      await navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard!");
      setLoading(false);
      handleCancelProject();
    } catch (error) {
      toast.error("Share failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ArDialog
      title="Share Project"
      dialogOpen={dialogOpen}
      handleCancel={handleCancelProject}
      buttonList={[
        { title: "Cancel", click: handleCancelProject },
        { title: "SHARE", click: handleSaveProject, loading: loading },
      ]}
      width={"50vw"}
    >
      <Box component="form" noValidate autoComplete="off">
        <div className="w-[100%]">
          <TextField
            fullWidth
            label="Shareable Link"
            value={link}
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            margin="normal"
          />
        </div>
      </Box>
    </ArDialog>
  );
};

export default Share;
