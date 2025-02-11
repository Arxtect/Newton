/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useCallback,
} from "react";

import { LatexEditorContainer } from "@/features/latexEditor/LatexEditorContainer";
import { initializeLatexEngines } from "@/features/latexCompilation/loadEngines";
import { PdfPreview } from "@/features/pdfPreview/PdfPreview";
import TopBar from "./components/topBar";
import ContentTopBar from "./components/content/topBar";
import Layout from "./layout";
import FileSystem from "./components/fileSystem";
import { refreshAuth } from "@/services";
import { useNavigate } from "react-router-dom";
import {
  findAllProject,
  getProjectInfo,
  getShareUserStoragePath,
  createProjectInfo,
} from "domain/filesystem";
import { useFileStore, useUserStore, useEditor } from "store";
import { ProjectSync } from "@/convergence";
import { getYDocToken } from "services";
import { getRoomUserAccess, UpdateProject } from "@/services";
import { toast } from "react-toastify";
import { ArLoadingScreen } from "@/components/arLoading";
import path from "path";

const Newton = () => {
  const navigate = useNavigate();

  const {
    filepath,
    setMainFile,
    currentProjectRoot,
    projectSync,
    updateProjectSync,
    updateShareIsRead,
    changeMainFile,
    leaveProjectSyncRoom,
    changeCurrentProjectRoot,
    parentDirStore,
  } = useFileStore((state) => ({
    filepath: state.filepath,
    setMainFile: state.setMainFile,
    currentProjectRoot: state.currentProjectRoot,
    projectSync: state.projectSync,
    updateProjectSync: state.updateProjectSync,
    updateShareIsRead: state.updateShareIsRead,
    changeMainFile: state.changeMainFile,
    leaveProjectSyncRoom: state.leaveProjectSyncRoom,
    changeCurrentProjectRoot: state.changeCurrentProjectRoot,
    parentDirStore: state.parentDir,
  }));

  useLayoutEffect(() => {
    initializeLatexEngines();
  }, []);

  const { user } = useUserStore((state) => ({
    user: state.user,
  }));
  const { editor } = useEditor((state) => ({
    editor: state.editor,
  }));

  const getYDocTokenReq = async (room) => {
    const res = await getYDocToken(room);
    return res;
  };

  const [loading, setLoading] = useState(true);

  const UpdateProjectSyncService = async (id, is_sync) => {
    const res = await UpdateProject(id, "", "", "", "", is_sync);
    return res;
  };

  const initShareProject = useCallback(async () => {
    if (!user?.id) return;
    const projectInfo = await getProjectInfo(currentProjectRoot);

    const project_id = projectInfo?.["project_id"];

    const project = projectInfo?.["project_name"];
    const roomId = projectInfo?.["owner_id"];
    const isSync = projectInfo?.["is_sync"];
    let parentDir = getShareUserStoragePath(roomId);

    if (user.id == roomId && parentDirStore == ".") {
      parentDir = ".";
    }

    console.log(projectInfo, isSync, project, roomId, "projectInfo");

    if (!project || !roomId) {
      setLoading(false);
      return;
    }

    const res = await getRoomUserAccess({
      project_name: project + roomId,
    });
    if (res?.status != "success") {
      toast.error("Get room user access failed.");
      return;
    }

    if (res?.access == "r") {
      updateShareIsRead(true);
      toast.info(
        "The project is read-only for you, please contact your project manager to modify it."
      );
    }

    if (res?.access == "no") {
      toast.info(
        "The project is not shared for you, please contact your project manager to modify it."
      );
      navigate("/project");
      return;
    }
    const { token, position } = await getYDocTokenReq(project + roomId);
    const projectSyncClass = await new ProjectSync(
      project,
      user,
      roomId,
      token,
      position,
      () => {},
      false,
      parentDir
    );

    projectSyncClass.setObserveHandler();
    updateProjectSync(projectSyncClass.saveState);

    if (!isSync) {
      await UpdateProjectSyncService(project_id, true);
      await createProjectInfo(project, {
        is_sync: true,
      });

      await projectSyncClass.syncFolderToYMapRootPath();
    }

    const waitForSync = new Promise((resolve, reject) => {
      const checkSyncComplete = () => {
        if (projectSyncClass.isInitialSyncComplete) {
          resolve();
          setLoading(false);
        } else {
          setTimeout(checkSyncComplete, 50);
        }
      };
      checkSyncComplete();
    });

    // Set a timeout for 10 seconds
    const timeout = new Promise((_, reject) =>
      setTimeout(() => {
        setLoading(false);
        reject(new Error("Sync timed out, please try again"));
      }, 30000)
    );

    // Wait for either the sync to complete or the timeout
    await Promise.race([waitForSync, timeout]);
  }, [user, currentProjectRoot]);

  useEffect(() => {
    if (projectSync && editor != null && filepath) {
      editor.blur && editor.blur();
      projectSync?.updateEditorAndCurrentFilePath &&
        projectSync?.updateEditorAndCurrentFilePath(filepath, editor);
    }
  }, [filepath, projectSync, editor]);

  useEffect(() => {
    if (!currentProjectRoot) return;
    initShareProject()
      .then(() => {
        changeMainFile(currentProjectRoot);
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
        toast.error(error.message);
        console.log(error, "error");
      });
    return () => {
      setMainFile("");
    };
  }, [currentProjectRoot]);

  useEffect(() => {
    setLoadingProject(true);
    handleProject();
    refreshAuth();
    return () => {
      console.log("leaveProjectSyncRoom");
      leaveProjectSyncRoom();
    };
  }, []);

  const [loadingProject, setLoadingProject] = useState(true);

  const handleProject = () => {
    try {
      const hash = window.location.hash;
      const queryString = hash.includes("?") ? hash.split("?")[1] : "";
      const searchParams = new URLSearchParams(queryString);

      const project = searchParams.get("project");
      const parentDir = searchParams.get("parentDir");
      if (!project) {
        return;
      }
      console.log(project, "project");
      changeCurrentProjectRoot({
        projectRoot: path.join(parentDir, project),
        parentDir: parentDir,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingProject(false);
    }
  };

  return !loading && !loadingProject ? (
    <React.Fragment>
      <TopBar></TopBar>
      <Layout
        left={<FileSystem />}
        // rightBefore={<RightBefore />}
        header={<ContentTopBar />}
        // rightBeforeRight={<ButtonBarContainer />}
        content={<LatexEditorContainer />}
        preview={<PdfPreview />}
      ></Layout>
    </React.Fragment>
  ) : (
    <ArLoadingScreen text="Loading" />
  );
};

export default Newton;
