import React, { useState, useRef, useEffect } from "react";
import { useEditor, useFileStore } from "@/store";
import ArIcon from "@/components/arIcon";


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
      console.log(lines, "lines");
      setShowCollapseButton(lines > 9);
      setIsCollapsed(lines > 9);
    }
  }, [content]);

  return (
    <div className="mt-2 bg-gray-200 border rounded">
      <div
        ref={contentRef}
        className={` ${
          isCollapsed ? "collapsed" : "expanded"
        }`}
        style={{
          overflow: "hidden",
          height: isCollapsed ? "150px" : "auto",
          transition: "height 0.3s ease",
        }}
      >
        <pre className={`text-xs px-2 py-2 whitespace-pre-wrap`}>{content}</pre>
      </div>
      {showCollapseButton && (
        <div 
        className="h-10 relative text-center flex items-center justify-center"
        style={{
          marginTop: isCollapsed ? "-40px" : "0px",
          backgroundImage: 'linear-gradient(0, #e7e9ee, transparent)',
        }}> 
          <button
            className="flex text-black cursor-pointer items-center hover:bg-green-500 rounded-full bg-white px-2 border border-black text-sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ArIcon name="ExpandMore" className="w-3 h-3"/> : <ArIcon name="ExpandLess" className="w-3 h-3"/>}
            &nbsp;
            {isCollapsed ? "Expand" : "Collapse"}
          </button>
        </div>
      )}
    </div>
  );
};

const typeColors = {
  error: 'red',
  warning: 'yellow',
  typesetting: 'blue',
  default: 'gray'
};

const Message = ({ type, title, file, line, details, content }) => {
  let headerColor = `bg-${typeColors[type] || typeColors.default}-600`;
  let buttonColor = `bg-${typeColors[type] || typeColors.default}-700`;
  let buttonHoverColor = `bg-${typeColors[type] || typeColors.default}-800`;

  const { editor } = useEditor();
  const { fileList, currentProjectRoot, loadFile } = useFileStore((state) => ({
    currentProjectRoot: state.currentProjectRoot,
    loadFile: state.loadFile,
    fileList: state.currentProjectFileList,
  }));
  const handleLocate = async(file, line) => {
    if(editor) {
      const filePath = `${currentProjectRoot}/${file}`;
      await loadFile({ filepath: filePath });
      const lineInt = parseInt(line, 10);
      if(!isNaN(lineInt)) {
        editor.focus();
        editor.gotoLine(lineInt);
      }
    }
  }

  return (
    <div className={`mb-4 border overflow-hidden rounded`}>
      <header className={`flex justify-between items-center font-bold px-3 py-1 text-white ${headerColor}`}>
        <h3>{title}</h3>
        {file && (
          <button
            style={{ maxWidth: "33%" }}
            className={`relative flex text-sm items-center cursor-pointer px-1 rounded-full ${buttonColor} text-white hover:${buttonHoverColor}`}
            onClick={fileList.includes(file) ? () => handleLocate(file, line) : null}
            title={line ? file + ', ' + line : file}
          >
            <ArIcon 
              name={"LinkBold"} 
              style={{ top: "10px", left: "15px" }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2" 
            />
            &nbsp;
            <div className="1rem pl-5 pr-1 overflow-hidden whitespace-nowrap text-ellipsis">
              {line ? file + ', ' + line : file}
            </div>
          </button>

        )}
      </header>
      <div className="px-3 py-3 text-black whitespace-pre-wrap">
        {details && <div className="text-sm">{details.trim()}</div>}
        {content && <CollapsibleText content={content} />}
      </div>
    </div>
  );
};

const FormattedCompilerLog = ({ messages, log }) => {
  
  console.log(messages, "messages");
  return (
    <div className="p-3 bg-white">
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
