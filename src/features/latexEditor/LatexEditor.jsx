import React, { useEffect, useRef, useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-latex";
// import "ace-builds/src-noconflict/theme-github";
// import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-min-noconflict/ext-searchbox";
import AiTools from "./aiTools";
import { useEditor, useFileStore } from "@/store";
import AutoCompleteManager from "@/features/autoComplete/AutoCompleteManager"; // 导入自定义补全器


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
      console.log("Cleaning up editor reference");
      updateEditor(null);
    };
  }, [latexRef]);

  useEffect(() => {
    if (!editor && !filepath) return;
    loadFile({ filepath: filepath });
  }, [editor]);
  
  const [isSetupCompleter, setisSetupCompleter] = useState(false)

  const [completer, setCompleter] = useState(null)

  useEffect(() => {
    if (
      latexRef.current &&
      latexRef.current.editor &&
      fileList?.length > 0 &&
      !!filepath
    ) {
      setisSetupCompleter(true);
      if(isSetupCompleter) {
        completer&&completer.changeCurrentFilePath(filepath);
        completer&&completer.changeCitationCompleter(bibFilepathList);
        return
      }
      let newCompleter = new AutoCompleteManager(latexRef.current.editor,fileList, bibFilepathList,filepath);
      setCompleter(newCompleter);
    }
  }, [fileList, bibFilepathList, filepath]);

  useEffect(() => {
    return () => {
      completer&&completer.offAddEventListener&&completer.offAddEventListener()
    }
  },[])

  return (
    <div className="h-full relative" id="editor">
      <AceEditor
        mode="latex"
        // theme="theme-github" //monokai
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
          // enableBasicAutocompletion: true,
          // enableLiveAutocompletion: true,
          // enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
          readOnly: filepath === "",
        }}
        ref={latexRef}
        className={filepath === "" ? "disabled-editor" : "ace_editor ace-tm"}
      ></AceEditor>
      <AiTools editorRef={latexRef} />
      {/* <div className="input overlay">{fragments}</div> */}
      <div id="users"></div>
    </div>
  );
};

export default React.memo(LatexEditor);
