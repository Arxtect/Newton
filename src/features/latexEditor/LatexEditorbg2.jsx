import React, { useEffect, useRef, useState } from "react";
import ace from "ace-builds";
import "ace-builds/src-noconflict/mode-latex";
// import "ace-builds/src-noconflict/theme-github";
// import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-min-noconflict/ext-searchbox";
import AiTools from "./aiTools.jsx";
import { useEditor, useFileStore } from "@/store";
import AutoCompleteManager from "../autoComplete/AutoCompleteManager.js";

const LatexEditor = ({
  handleChange,
  sourceCode,
  filepath,
  fileList,
  bibFilepathList,
}) => {
  const editorRef = useRef(null);
  const aceContainerRef = useRef(null);

  const { editor, updateEditor } = useEditor((state) => ({
    editor: state.editor,
    updateEditor: state.updateEditor,
  }));

  const { loadFile } = useFileStore((state) => ({
    loadFile: state.loadFile,
  }));

  useEffect(() => {
    if (aceContainerRef.current) {
      const aceEditor = ace.edit(aceContainerRef.current);
      aceEditor.session.setMode("ace/mode/latex");
      aceEditor.setOptions({
        wrap: true,
        fontSize: "16px",
        showPrintMargin: false,
        lineHeight: 24,
        tabSize: 2,
        readOnly: filepath === "",
        // enableBasicAutocompletion: true,
        // enableLiveAutocompletion: true,
        // enableSnippets: true,
        // showLineNumbers: true,
      });
      aceEditor.setValue(sourceCode, -1); // -1 to move cursor to the start
      aceEditor.on("change", () => {
        handleChange(aceEditor.getValue());
      });

      editorRef.current = aceEditor;
      updateEditor(aceEditor);

      return () => {
        aceEditor.destroy();
        updateEditor(null);
      };
    }
  }, [aceContainerRef.current, filepath]);

  useEffect(() => {
    if (!editor && !filepath) return;
    loadFile({ filepath: filepath });
  }, [editor, filepath]);

  const [isSetupCompleter, setIsSetupCompleter] = useState(false);

  useEffect(() => {
    if (
      editorRef.current &&
      fileList?.length > 0 &&
      !!filepath &&
      !isSetupCompleter
    ) {
      setIsSetupCompleter(true);
      let autocomplete = new AutoCompleteManager(editorRef.current, {
        fileList,
        autoComplete: true,
        editorValue: sourceCode,
      });
    }
  }, [fileList, bibFilepathList, filepath,editorRef]);

  return (
    <div className="h-full relative" id="editor">
      <div ref={aceContainerRef} className={filepath === "" ? "disabled-editor" : "ace_editor ace-tm"} style={{ height: '100%', width: '100%' }}></div>
      <AiTools editor={editorRef.current} />
    </div>
  );
};

export default React.memo(LatexEditor);