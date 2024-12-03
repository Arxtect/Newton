import React, { useEffect, useRef, useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-latex";
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-min-noconflict/ext-searchbox";

import { useEditor, useFileStore } from "@/store";
import AutoCompleteManager from "@/features/autoComplete/AutoCompleteManager";

import EditorStateManager from "./component/editorStateManager"; // Import the class
import AiTools from "./component/aiTools";
import useAutoCompile from "./hook";
import { useEngineStatusStore } from "@/store";
import FileView from "@/features/fileView";

import { typeset, loadExtensions } from "./texMathjax";

const LatexEditor = ({ handleChange, sourceCode, filepath, mainFilepath }) => {
  const latexRef = useRef(null);

  const { editor, updateEditor } = useEditor((state) => ({
    editor: state.editor,
    updateEditor: state.updateEditor,
  }));

  const {
    loadFile,
    currentProjectRoot,
    updateCurrentProjectFileList,
    touchCounter,
    assetsFilePath,
  } = useFileStore((state) => ({
    loadFile: state.loadFile,
    currentProjectRoot: state.currentProjectRoot,
    updateCurrentProjectFileList: state.updateCurrentProjectFileList,
    touchCounter: state.touchCounter,
    assetsFilePath: state.assetsFilePath,
  }));

  useEffect(() => {
    loadExtensions();
    console.log(latexRef.current, "latexRef.current");
    if (latexRef.current && latexRef.current.editor) {
      console.log("Updating editor reference", latexRef.current.editor);
      updateEditor(latexRef.current.editor);
    }
    return () => {
      updateEditor(null);
    };
  }, [latexRef]);

  useEffect(() => {
    if (!editor || !mainFilepath) return;
    loadFile({ filepath: mainFilepath });
  }, [editor]);

  const [isSetupCompleter, setIsSetupCompleter] = useState(false);
  const [completer, setCompleter] = useState(null);

  // auto completer
  useEffect(() => {
    if (latexRef.current && latexRef.current.editor && !!filepath) {
      updateCurrentProjectFileList(currentProjectRoot).then(
        ([fileList, bibFilepathList]) => {
          setIsSetupCompleter(true);
          if (completer) {
            completer.changeCurrentFileListAndBibFilePathList(
              fileList,
              bibFilepathList
            );
          }
          if (isSetupCompleter) {
            completer && completer.changeCurrentFilePath(filepath);
            completer && completer.changeCitationCompleter(bibFilepathList);
            return;
          }
          console.log(fileList, bibFilepathList, "fileList, bibFilepathList");
          let newCompleter = new AutoCompleteManager(
            latexRef.current.editor,
            fileList,
            bibFilepathList,
            filepath,
            currentProjectRoot
          );
          setCompleter(newCompleter);
        }
      );
    }
  }, [filepath, currentProjectRoot, touchCounter]);

  useEffect(() => {
    return () => {
      completer &&
        completer.offAddEventListener &&
        completer.offAddEventListener();
    };
  }, []);

  const [editorStateManager, setEditorStateManager] = useState(null);

  useEffect(() => {
    if (editorStateManager) {
      console.log("Cleaning up editor state manager");
      editorStateManager.destroy();
    }
    if (latexRef.current && latexRef.current.editor) {
      updateEditor(latexRef.current.editor);
      const manager = new EditorStateManager(latexRef.current.editor, filepath);
      setEditorStateManager(manager);
      manager.applyState();
    }
    return () => {
      if (editorStateManager) {
        console.log("Cleaning up editor state manager");
        editorStateManager.destroy();
      }
      updateEditor(null);
    };
  }, [latexRef, filepath]);

  // auto compile
  const { setIsTriggerCompile } = useEngineStatusStore();
  useAutoCompile(sourceCode, currentProjectRoot, mainFilepath);

  const handleChangeAutoCompile = (editorValue) => {
    handleChange(editorValue);
    setIsTriggerCompile(true);
  };

  // math preview
  const [svgOutput, setSvgOutput] = useState("");
  const [hoveredLine, setHoveredLine] = useState(null);

  const renderMath = (latex) => {
    try {
      const svg = typeset(latex, { scale: 1, color: "black" });
      setSvgOutput(svg);
    } catch (error) {
      console.error("Error rendering LaTeX:", error);
    }
  };

  const handleMouseMove = (e) => {
    const editor = latexRef.current.editor;
    const { row } = editor.renderer.screenToTextCoordinates(
      e.clientX,
      e.clientY
    );
    const lineCount = editor.session.getLength();
    let lineContent = editor.session.getLine(row);

    if (lineContent.includes("\\begin{equation}")) {
      let equationContent = lineContent;
      let currentRow = row + 1;

      while (currentRow < lineCount) {
        const nextLine = editor.session.getLine(currentRow);
        equationContent += "\n" + nextLine;
        if (nextLine.includes("\\end{equation}")) {
          break;
        }
        currentRow++;
      }

      if (equationContent.includes("\\end{equation}")) {
        setHoveredLine(row);
        renderMath(equationContent);
      } else {
        setHoveredLine(null);
        setSvgOutput("");
      }
    } else {
      setHoveredLine(null);
      setSvgOutput("");
    }
  };

  useEffect(() => {
    if (!latexRef.current || !latexRef.current.editor) return;
    const editor = latexRef.current.editor;
    editor.on("mousemove", handleMouseMove);
    return () => {
      editor.off("mousemove", handleMouseMove);
    };
  }, [latexRef.current]);

  return (
    <div className="h-full relative" id="editor">
      <AceEditor
        mode="latex"
        name="aceEditor"
        height="100%"
        width="100%"
        wrapEnabled={true}
        fontSize="16px"
        editorProps={{ $blockScrolling: true }}
        onChange={handleChangeAutoCompile}
        value={sourceCode}
        showPrintMargin={false}
        lineHeight={24}
        setOptions={{
          showLineNumbers: true,
          tabSize: 2,
          readOnly: filepath === "",
        }}
        ref={latexRef}
        className={filepath === "" ? "disabled-editor" : "ace_editor ace-tm"}
      ></AceEditor>
      {latexRef?.current?.editor && (
        <AiTools editor={latexRef.current.editor} completer={completer} />
      )}
      {!!assetsFilePath && <FileView filename={assetsFilePath} />}
      {hoveredLine !== null && (
        <div
          className="absolute bg-[#fafafa] px-5 py-2 text-black z-50"
          style={{
            border: "1px solid #ccc",
            borderRadius: "5px",
            top: `${
              hoveredLine < 5
                ? (hoveredLine + 1) * 24
                : (hoveredLine - 2.5) * 24
            }px`,
            left: `${latexRef.current.editor.renderer.gutterWidth + 5}px`,
          }}
          dangerouslySetInnerHTML={{ __html: svgOutput }}
        />
      )}
    </div>
  );
};

export default React.memo(LatexEditor);
