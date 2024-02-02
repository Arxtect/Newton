/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-01-25 13:51:21
 */
// Hooks
import React, { useLayoutEffect, useEffect } from "react";
// Components
import { LatexEditorContainer } from "@/features/latexEditor/LatexEditorContainer";
import { PdfPreview } from "@/features/pdfPreview/PdfPreview";
// Redux
import { initializeLatexEngines } from "@/features/latexCompilation/latexCompilation";
import { SplitPane } from "@/components/SplitPane";
import { ButtonBarContainer } from "@/features/buttonBar/ButtonBarContainer";
import useSwitchTheme from "@/useHooks/useSwitchTheme";
import ResizeSlider from "./resizeSlider";
import "./index.css";

const Arxtect = () => {
  useSwitchTheme();
  // At component mount, setup all of the LaTeX engines
  useLayoutEffect(() => {
    initializeLatexEngines();
  }, []);

  useEffect(() => {
    console.log("1111");
  }, []);

  // The actual app
  return (
    <main className="max-w-[99vw]">
      <ResizeSlider>
        <ButtonBarContainer />
        <SplitPane>
          <LatexEditorContainer />
          <PdfPreview />
        </SplitPane>
      </ResizeSlider>
    </main>
  );
};

export default React.memo(Arxtect);
