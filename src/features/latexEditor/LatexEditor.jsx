import React, { useEffect, useRef, useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-latex";
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-min-noconflict/ext-searchbox";
import AiTools from "./aiTools";
import { useEditor, useFileStore } from "@/store";
import AutoCompleteManager from "@/features/autoComplete/AutoCompleteManager";
import EditorStateManager from "./EditorStateManager"; // Import the class

const LatexEditor = ({
  handleChange,
  sourceCode,
  filepath,
  fileList,
  bibFilepathList,
}) => {
  const latexRef = useRef(null);

  const { editor, updateEditor } = useEditor((state) => ({
    editor: state.editor,
    updateEditor: state.updateEditor,
  }));

  const { loadFile } = useFileStore((state) => ({
    loadFile: state.loadFile,
  }));

  useEffect(() => {
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
    if (!editor && !filepath) return;
    loadFile({ filepath: filepath });
  }, [editor]);

  const [isSetupCompleter, setIsSetupCompleter] = useState(false);
  const [completer, setCompleter] = useState(null);

  // auto completer
  useEffect(() => {
    if (
      latexRef.current &&
      latexRef.current.editor &&
      fileList?.length > 0 &&
      !!filepath
    ) {
      setIsSetupCompleter(true);
      if (isSetupCompleter) {
        completer && completer.changeCurrentFilePath(filepath);
        completer && completer.changeCitationCompleter(bibFilepathList);
        return;
      }
      let newCompleter = new AutoCompleteManager(
        latexRef.current.editor,
        fileList,
        bibFilepathList,
        filepath
      );
      setCompleter(newCompleter);
    }
  }, [fileList, bibFilepathList, filepath]);

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
        onChange={handleChange}
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
      {/* {latexRef?.current?.editor && (
        <AiTools editor={latexRef.current.editor} completer={completer} />
      )} */}
      <div id="users"></div>
    </div>
  );
};

export default React.memo(LatexEditor);
