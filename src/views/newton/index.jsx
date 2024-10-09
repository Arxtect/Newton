/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-11 11:53:35
 */
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";

import { LatexEditorContainer } from "@/features/latexEditor/LatexEditorContainer";
import { initializeLatexEngines } from "@/features/latexCompilation/loadEngines";
import { useFileStore } from "store";
import { PdfPreview } from "@/features/pdfPreview/PdfPreview";
import TopBar from "./components/topBar";
import ContentTopBar from "./components/content/topBar";
import Layout from "./layout";
import FileSystem from "./components/fileSystem";

const Index = () => {
  useLayoutEffect(() => {
    initializeLatexEngines();
  }, []);

  const { leaveProjectSyncRoom } = useFileStore((state) => ({
    leaveProjectSyncRoom: state.leaveProjectSyncRoom,
  }));

  useEffect(() => {
    return () => {
      leaveProjectSyncRoom();
    };
  }, []);

  return (
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
  );
};

export default Index;
