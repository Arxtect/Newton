
// Hooks
import React, { useLayoutEffect, useEffect } from "react";
// Components
import { LatexEditorContainer } from "@/features/latexEditor/LatexEditorContainer";
import { PdfPreview } from "@/features/pdfPreview/PdfPreview";
import { initializeLatexEngines } from "@/features/latexCompilation/latexCompilation";
import { SplitPane } from "@/components/SplitPane";
import { ButtonBarContainer } from "@/features/buttonBar/ButtonBarContainer";
import { useSwitchTheme } from "@/useHooks";
import { ResizeSlider, ResizeRightSlider } from "./resizeSlider";
import "./index.css";
import { uploadDocument } from "services";
import { usePdfPreviewStore } from "store";

const Arxtect = () => {
  useSwitchTheme();
  // At component mount, setup all of the LaTeX engines
  useLayoutEffect(() => {
    initializeLatexEngines();
  }, []);

  const { pdfUrl } = usePdfPreviewStore();

  return (
    <main className="max-w-[99vw]">
      <ResizeSlider>
        <ButtonBarContainer />
        <SplitPane>
          <LatexEditorContainer />
          <ResizeRightSlider>
            <PdfPreview />
          </ResizeRightSlider>
        </SplitPane>
      </ResizeSlider>
    </main>
  );
};

export default React.memo(Arxtect);
