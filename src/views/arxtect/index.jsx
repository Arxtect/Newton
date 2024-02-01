/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
// Hooks
import { useLayoutEffect } from "react";
// Components
import { LatexEditorContainer } from "../../features/latexEditor/LatexEditorContainer";
import { PdfPreview } from "../../features/pdfPreview/PdfPreview";
// Redux
import { initializeLatexEngines } from "../../features/latexCompilation/latexCompilation";
import { SplitPane } from "../../components/SplitPane";
import { ButtonBarContainer } from "../../features/buttonBar/ButtonBarContainer";
import useSwitchTheme from "../../useHooks/useSwitchTheme";
import ResizeSlider from "./resizeSlider";
import "./index.css";

const Arxtect = () => {
  useSwitchTheme();
  // At component mount, setup all of the LaTeX engines
  useLayoutEffect(() => {
    initializeLatexEngines();
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

export default Arxtect;
