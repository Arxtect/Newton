import React, { useState, useRef, useEffect } from "react";
import { useEditor, useFileStore } from "@/store";

const CollapsibleText = ({ content }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showCollapseButton, setShowCollapseButton] = useState(false);

  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(contentRef.current).lineHeight
      );
      const lines = contentRef.current.scrollHeight / lineHeight;
      setShowCollapseButton(lines > 3);
    }
  }, [content]);

  return (
    <div className="mt-2 p-2 bg-gray-100 border rounded">
      <div
        ref={contentRef}
        className={`whitespace-pre-wrap ${
          isCollapsed ? "collapsed" : "expanded"
        }`}
        style={{
          overflow: "hidden",
          height: isCollapsed ? "70px" : "auto",
          transition: "height 0.3s ease",
        }}
      >
        {content}
      </div>
      {showCollapseButton && (
        <button
          className="text-blue-500 hover:underline mx-auto block mt-2"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "Expand" : "Collapse"}
        </button>
      )}
    </div>
  );
};

const Message = ({ type, title, file, line, details, content }) => {
  let headerColor;
  switch (type) {
    case "error":
      headerColor = "bg-red-500 text-white";
      break;
    case "warning":
      headerColor = "bg-yellow-500 text-white";
      break;
    case "typesetting":
      headerColor = "bg-blue-500 text-white";
      break;
    default:
      headerColor = "bg-gray-500 text-white";
  }

  const { editor } = useEditor();
  const { fileList, currentProjectRoot, loadFile } = useFileStore((state) => ({
    currentProjectRoot: state.currentProjectRoot,
    loadFile: state.loadFile,
    fileList: state.currentProjectFileList,
  }));
  const handleLocateLine = (lineNumber) => {
    if(editor) {
      const lineNumberInt = parseInt(lineNumber, 10);
      if(!isNaN(lineNumberInt)) {
        editor.focus();
        editor.gotoLine(lineNumberInt);
      }
    }
  }

  return (
    <div className={`mb-4 border`}>
      <div className={`flex justify-between items-center p-2 ${headerColor}`}>
        <div className="font-bold">{title}</div>
        <div
          className={`text-sm cursor-pointer text-blue-500 hover:underline`}
          onClick={fileList.includes(file) ? async () => {
            const filePath = `${currentProjectRoot}/${file}`;
            await loadFile({ filepath: filePath });
            handleLocateLine(line);
          } : null}
        >
          {file && file}
          {file && ","} {line && line}
        </div>
      </div>
      <div className="p-4 whitespace-pre-wrap">
        <div>{details}</div>
        {content && <CollapsibleText content={content} />}
      </div>
    </div>
  );
};

const FormattedCompilerLog = ({ messages, log }) => {
  
  console.log(messages, "messages");
  return (
    <div className="p-6">
      {messages.map((msg, index) => (
        <Message
          key={index}
          type={msg.level}
          title={msg.message}
          file={msg.file}
          line={msg.line}
          details={msg.content}
          content={msg.raw}
        />
      ))}
      {log && (
        <Message key={"log"} type={"info"} title={"Raw Logs"} content={log} />
      )}
    </div>
  );
};

export default FormattedCompilerLog;
