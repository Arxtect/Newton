/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-06 21:26:51
 */
import React, { useEffect, useState } from "react";
import ArDialog from "@/components/arDialog";
import {
  TextField,
  Box,
} from "@mui/material";
import { toast } from "react-toastify";
import { ProjectSync } from "@/convergence";


const Share = ({ dialogOpen, setDialogOpen, rootPath, user }) => {
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState("");

  useEffect(() => {
    console.log(rootPath, 'rootPath')
    const generatedLink = `${window.location.origin}/project#/project?project=${rootPath}&&roomId=${user.id}`;
    setLink(generatedLink);
  }, []);

  const handleCancelProject = () => {
    setDialogOpen(false);
  };

  const createProjectSync = async (rootPath, user) => {
    const projectSync = new ProjectSync(
      rootPath,
      user,
      user.id,
      (filePath, content) => {
        console.log("File changed:", filePath, content);
      },
    );

    setInterval(async () => {
      // 同步整个文件夹
      await projectSync.syncFileToYMap('inform7/uuid.txt');;
    }, [2000])

  };


  const handleSaveProject = async () => {
    setLoading(true);
    try {
      // 创建 ProjectSync 实例
      await createProjectSync(rootPath, user);

      await navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard!");
      setLoading(false);
      handleCancelProject()
    } catch (error) {
      toast.error("Failed to copy link!");
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
        { title: "Copy", click: handleSaveProject, loading: loading },
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