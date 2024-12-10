/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";

import { LatexEditorContainer } from "@/features/latexEditor/LatexEditorContainer";
import { initializeLatexEngines } from "@/features/latexCompilation/loadEngines";
import { PdfPreview } from "@/features/pdfPreview/PdfPreview";
import TopBar from "./components/topBar";
import ContentTopBar from "./components/content/topBar";
import Layout from "./layout";
import FileSystem from "./components/fileSystem";
import { refreshAuth } from "@/services";
import { useNavigate } from "react-router-dom";
import { findAllProject, getProjectInfo } from "domain/filesystem";
import { useFileStore, useUserStore, useEditor } from "store";
import { ProjectSync } from "@/convergence";
import { getYDocToken } from "services";
import { getRoomUserAccess } from "@/services";
import { toast } from "react-toastify";
import LoadingScreen from "@/components/arLoading";

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
  } = useFileStore((state) => ({
    filepath: state.filepath,
    setMainFile: state.setMainFile,
    currentProjectRoot: state.currentProjectRoot,
    projectSync: state.projectSync,
    updateProjectSync: state.updateProjectSync,
    updateShareIsRead: state.updateShareIsRead,
    changeMainFile: state.changeMainFile,
    leaveProjectSyncRoom: state.leaveProjectSyncRoom,
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

  const initShareProject = async () => {
    const projectInfo = await getProjectInfo(currentProjectRoot);

    const project = projectInfo?.["rootPath"];
    const roomId = projectInfo?.["userId"];
    const isSync = projectInfo?.["isSync"];

    console.log(projectInfo, "projectInfo");

    if (!isSync || !project || !roomId) {
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
    const projectSync = await new ProjectSync(
      project,
      user,
      roomId,
      token,
      position
    );
    await projectSync.setObserveHandler();
    console.log(projectSync, "projectSync");

    const waitForSync = new Promise((resolve, reject) => {
      const checkSyncComplete = () => {
        if (projectSync.isInitialSyncComplete) {
          resolve();
          setLoading(false);
        } else {
          setTimeout(checkSyncComplete, 100);
        }
      };
      checkSyncComplete();
    });

    // Set a timeout for 10 seconds
    const timeout = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Sync timed out, please try again")),
        60000
      )
    );

    // Wait for either the sync to complete or the timeout
    await Promise.race([waitForSync, timeout]);

    updateProjectSync(projectSync.saveState);
  };

  useEffect(() => {
    if (projectSync && editor != null && filepath) {
      editor.blur && editor.blur();
      projectSync?.updateEditorAndCurrentFilePath &&
        projectSync?.updateEditorAndCurrentFilePath(filepath, editor);
    }
  }, [filepath, projectSync, editor]);

  useEffect(() => {
    initShareProject()
      .then(() => {
        console.log(currentProjectRoot, "currentProjectRoot");
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
  }, []);

  useEffect(() => {
    refreshAuth();
    return () => {
      leaveProjectSyncRoom();
    };
  }, []);

  return !loading ? (
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
    <LoadingScreen text="Loading" />
  );
};

export default Newton;
