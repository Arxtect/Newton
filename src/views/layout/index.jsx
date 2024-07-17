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
import RightBefore from "./rightBefore";

const Index = () => {
  useLayoutEffect(() => {
    initializeLatexEngines();
  }, []);

  return (
    <Layout
      left={<FileSystem />}
      rightBefore={<RightBefore />}
      // rightBeforeRight={<ButtonBarContainer />}
      content={<LatexEditorContainer />}
      preview={<PdfPreview />}
    ></Layout>
  );
};

export default Index;
