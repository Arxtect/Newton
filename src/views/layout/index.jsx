/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-03-11 11:53:35
 */
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import Layout from "./layout";
import FileSystem from "./fileSystem";
import { LatexEditorContainer } from "@/features/latexEditor/LatexEditorContainer";
import { initializeLatexEngines } from "@/features/latexCompilation/latexCompilation";

import { PdfPreview } from "@/features/pdfPreview/PdfPreview";
import { ButtonBarContainer } from "@/features/buttonBar/ButtonBarContainer";
import TopBar from "./topBar";
import ContentTopBar from "./content/topBar";
import { useFileStore } from "store";

const Index = () => {
  useLayoutEffect(() => {
    initializeLatexEngines();
  }, []);
  const { leaveProjectSyncRoom } =
    useFileStore((state) => ({
      leaveProjectSyncRoom: state.leaveProjectSyncRoom,
     
    }));

  useEffect(() => {
    return ()=>{
      leaveProjectSyncRoom();
    }
  }, [])


  return (
    <React.Fragment>
      <TopBar ></TopBar>
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
