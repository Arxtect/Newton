// Hooks
import { useLayoutEffect } from "react";
// Components
import { LatexEditorContainer } from "./features/latexEditor/LatexEditorContainer";
import { PdfPreview } from "./features/pdfPreview/PdfPreview";
// Redux
import { initializeLatexEngines } from "./features/latexCompilation/latexCompilation";
import { SplitPane } from "./components/SplitPane";
import { ButtonBarContainer } from "./features/buttonBar/ButtonBarContainer";

const App = () => {
  // At component mount, setup all of the LaTeX engines
  useLayoutEffect(() => {
    initializeLatexEngines();
  }, []);

  // The actual app
  return (
    <main className="max-w-[99vw] m-[auto]">
      <ButtonBarContainer />
      <SplitPane>
        <LatexEditorContainer />
        <PdfPreview />
      </SplitPane>
    </main>
  );
};

export default App;
