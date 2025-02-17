import React, { useEffect, useRef, useState, useCallback } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-latex";
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-min-noconflict/ext-searchbox";

import { useEditor, useFileStore, usePdfPreviewStore } from "@/store";
import AutoCompleteManager from "@/features/autoComplete/AutoCompleteManager";

import EditorStateManager from "./component/editorStateManager"; // Import the class
import AiTools from "./component/aiTools";
import AiAutoComplete from "./component/aiAutoComplete";
import useAutoCompile from "./hook";
import { useEngineStatusStore, useLayout } from "@/store";
import FileView from "@/features/fileView";
import path from "path";

import { TexMathJax, loadExtensions } from "./texMathjax";

const isVipUser = () => {
  // TODO: check if user is vip
  return true; // Assuming the user is a VIP for testing purposes
};

const LatexEditor = ({ handleChange, sourceCode, filepath, mainFilepath }) => {
  const latexRef = useRef(null);

  const { editor, updateEditor } = useEditor((state) => ({
    editor: state.editor,
    updateEditor: state.updateEditor,
  }));

  const { setCompiledPdfUrl } = usePdfPreviewStore((state) => ({
    setCompiledPdfUrl: state.setCompiledPdfUrl,
  }));

  const {
    loadFile,
    currentProjectRoot,
    updateCurrentProjectFileList,
    touchCounter,
    assetsFilePath,
    parentDir,
    getCurrentProjectPdf,
  } = useFileStore((state) => ({
    loadFile: state.loadFile,
    currentProjectRoot: state.currentProjectRoot,
    updateCurrentProjectFileList: state.updateCurrentProjectFileList,
    touchCounter: state.touchCounter,
    assetsFilePath: state.assetsFilePath,
    parentDir: state.parentDir,
    getCurrentProjectPdf: state.getCurrentProjectPdf,
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
    (async () => {
      const blobUrl = await getCurrentProjectPdf(currentProjectRoot);
      if (blobUrl) {
        setCompiledPdfUrl(blobUrl);
      }
    })();

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
      {latexRef?.current?.editor && isVipUser() && (
        <AiAutoComplete editor={latexRef.current.editor} />
      )}
      {latexRef?.current?.editor && !isVipUser() && (
        <>
          <AiTools editor={latexRef.current.editor} completer={completer} />
        </>
      )}
      {!!assetsFilePath && <FileView filename={assetsFilePath} />}
      <TexMathJax latexRef={latexRef} />
    </div>
  );
};

export default React.memo(LatexEditor);
