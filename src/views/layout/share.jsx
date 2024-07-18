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
import { TextField, Box } from "@mui/material";
import { toast } from "react-toastify";
import { ProjectSync } from "@/convergence";
import { getProjectInfo } from "domain/filesystem";
import { updateDialogLoginOpen, useUserStore, useFileStore } from "@/store";
import share from "@/assets/share.svg";

const Share = forwardRef(({ rootPath, user }, ref) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const controlShare = async () => {
    const info = await getProjectInfo(rootPath);
    if (info.userId && info.userId != user.id) {
      toast.warning("This project is collaborative and cannot be shared");
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

  const createProjectSync = async (rootPath, user) => {
    const projectSync = new ProjectSync(rootPath, user, user.id);
    updateProjectSync(projectSync);
    await projectSync.syncFolderToYMapRootPath();
    setTimeout(() => {
      filepath && loadFile({ filepath: filepath });
    }, [500]);
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
    <React.Fragment>
      <button
        className={`flex items-center text-gray-700 px-2 py-1 hover:bg-gray-200 active:bg-[#9fd5a2] space-x-1 `}
        onClick={() => {
          controlShare();
        }}
      >
        <img src={share} alt="" className="w-4 h-4" />
        <span>Share</span> {/* 使用空格字符 */}
      </button>
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
    </React.Fragment>
  );
});

export default Share;
