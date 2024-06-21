/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
import React, { useEffect, useRef, useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-latex";
// import "ace-builds/src-noconflict/theme-github";
// import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-min-noconflict/ext-language_tools";
import "ace-builds/src-min-noconflict/ext-searchbox";
import AiTools from "./aiTools";
import { useEditor } from "@/store";

const LatexEditor = ({ handleChange, sourceCode, filepath }) => {
  const latexRef = useRef(null);

  const { updateEditor } = useEditor((state) => ({
    updateEditor: state.updateEditor,
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
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
        }}
        ref={latexRef}
        readOnly={filepath == "" ? true : false}
        className={filepath == "" ? "disabled-editor" : ""}
      ></AceEditor>
      <AiTools editorRef={latexRef} />
      {/* <div className="input overlay">{fragments}</div> */}
      <div id="users"></div>
    </div>
  );
};

export default React.memo(LatexEditor);
