import React, { useEffect, useRef, useState } from "react";
import { useCodeMirror } from "@uiw/react-codemirror";
import { useEditor, useFileStore, useEngineStatusStore } from "@/store";
import AutoCompleteManager from "@/features/autoComplete/AutoCompleteManager";
import EditorStateManager from "./component/editorStateManager";
import AiTools from "./component/aiTools";
import useAutoCompile from "./hook";
import FileView from "@/features/fileView";
import { TexMathJax, loadExtensions } from "./texMathjax";

const LatexEditor = ({ handleChange, sourceCode, filepath, mainFilepath }) => {
  const editorRef = useRef(null);
  const { updateEditor } = useEditor((state) => ({
    updateEditor: state.updateEditor,
  }));

  const {
    currentProjectRoot,
    updateCurrentProjectFileList,
    touchCounter,
    assetsFilePath,
  } = useFileStore((state) => ({
    currentProjectRoot: state.currentProjectRoot,
    updateCurrentProjectFileList: state.updateCurrentProjectFileList,
    touchCounter: state.touchCounter,
    assetsFilePath: state.assetsFilePath,
  }));

  const [completer, setCompleter] = useState(null);
  const { setIsTriggerCompile } = useEngineStatusStore();

  const { setContainer } = useCodeMirror({
    value: sourceCode,
    extensions: [],
    onChange: (value) => {
      handleChange(value);
      setIsTriggerCompile(true);
    },
    basicSetup: true,
  });

  useEffect(() => {
    loadExtensions();
    if (editorRef.current) {
      setContainer(editorRef.current);
    }
    return () => {
      updateEditor(null);
    };
  }, [editorRef, setContainer, updateEditor]);

  // useEffect(() => {
  //   if (filepath) {
  //     updateCurrentProjectFileList(currentProjectRoot).then(
  //       ([fileList, bibFilepathList]) => {
  //         if (completer) {
  //           completer.changeCurrentFileListAndBibFilePathList(
  //             fileList,
  //             bibFilepathList
  //           );
  //           completer.changeCurrentFilePath(filepath);
  //           completer.changeCitationCompleter(bibFilepathList);
  //         } else {
  //           const newCompleter = new AutoCompleteManager(
  //             editorRef.current,
  //             fileList,
  //             bibFilepathList,
  //             filepath,
  //             currentProjectRoot
  //           );
  //           setCompleter(newCompleter);
  //         }
  //       }
  //     );
  //   }
  // }, [filepath, currentProjectRoot, touchCounter]);

  useEffect(() => {
    return () => {
      completer?.offAddEventListener?.();
    };
  }, [completer]);

  const [editorStateManager, setEditorStateManager] = useState(null);

  // useEffect(() => {
  //   if (editorStateManager) {
  //     editorStateManager.destroy();
  //   }
  //   if (editorRef.current) {
  //     updateEditor(editorRef.current);
  //     const manager = new EditorStateManager(editorRef.current, filepath);
  //     setEditorStateManager(manager);
  //     manager.applyState();
  //   }
  //   return () => {
  //     editorStateManager?.destroy();
  //     updateEditor(null);
  //   };
  // }, [editorRef, filepath, updateEditor]);

  useAutoCompile(sourceCode, currentProjectRoot, mainFilepath);

  return (
    <div className="h-full relative" id="editor">
      <div
        ref={editorRef}
        className={filepath === "" ? "disabled-editor" : ""}
      />
      {/* {editorRef.current && (
        <AiTools editor={editorRef.current} completer={completer} />
      )} */}
      {/* {assetsFilePath && <FileView filename={assetsFilePath} />}
      <TexMathJax latexRef={editorRef} /> */}
    </div>
  );
};

export default React.memo(LatexEditor);
