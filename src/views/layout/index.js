import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import Layout from "./layout";
import GitTest from "../git-test";
import { LatexEditorContainer } from "@/features/latexEditor/LatexEditorContainer";
import { initializeLatexEngines } from "@/features/latexCompilation/latexCompilation";

import { PdfPreview } from "@/features/pdfPreview/PdfPreview";
import { ButtonBarContainer } from "@/features/buttonBar/ButtonBarContainer";

const Index = () => {
  useLayoutEffect(() => {
    initializeLatexEngines();
  }, []);
  return (
    <Layout
      left={<GitTest></GitTest>}
      rightBefore={<ButtonBarContainer />}
      content={<LatexEditorContainer />}
      preview={<PdfPreview />}
    ></Layout>
  );
};

export default Index;
