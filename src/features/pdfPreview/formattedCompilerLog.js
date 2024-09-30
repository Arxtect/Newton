import React, { useState, useRef, useEffect } from "react";
import { useEditor, useFileStore } from "@/store";
import ArIcon from "@/components/arIcon";
import path from "path";
import Tooltip from "@/components/tooltip";

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
        className={` ${isCollapsed ? "collapsed" : "expanded"}`}
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
            backgroundImage: "linear-gradient(0, #e7e9ee, transparent)",
          }}
        >
          <button
            className="flex text-black cursor-pointer items-center rounded-md  px-2 border border-[arxTheme] text-sm font-[Inter] py-[2px] bg-arxTheme hover:bg-arx-theme-hover"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ArIcon name="ExpandMore" className="w-3 h-3 mr-1" />
            ) : (
              <ArIcon name="ExpandLess" className="w-3 h-3 mr-1" />
            )}
            {isCollapsed ? "Expand" : "Collapse"}
          </button>
        </div>
      )}
    </div>
  );
};

const typeColors = {
  error: {
    header: "#F36D6D",
    button: "#DC2626",
    buttonHover: "hover:bg-[#B11B1B]",
  },
  warning: {
    header: "#FBBA49",
    button: "#F59E0B",
    buttonHover: "hover:bg-[#D97706]",
  },
  typesetting: {
    header: "#81C784",
    button: "#10B981",
    buttonHover: "hover:bg-[#047857]",
  },
  default: {
    header: "#BDBDBD",
    button: "#bdbdbd",
    buttonHover: "hover:bg-[#bdbdbd]",
  },
};

const Message = ({ type, title, file, line, details, content }) => {
  const colors = typeColors[type] || typeColors.default;
  const headerColor = colors["header"];
  const buttonColor = colors["button"];
  const buttonHoverColor = colors["buttonHover"];

  const { editor } = useEditor();
  const { fileList, currentProjectRoot, loadFile } = useFileStore((state) => ({
    currentProjectRoot: state.currentProjectRoot,
    loadFile: state.loadFile,
    fileList: state.currentProjectFileList,
  }));
  const handleLocate = async (file, line) => {
    const filePath = path.join(currentProjectRoot, file);

    if (!fileList.includes(file) && !fileList.includes(filePath)) {
      return null;
    }

    if (editor) {
      await loadFile({ filepath: filePath });
      const lineInt = parseInt(line, 10);
      if (!isNaN(lineInt)) {
        editor.focus();
        editor.gotoLine(lineInt);
      }
    }
  };

  return (
    <div className={`mb-4 border overflow-hidden rounded-lg`}>
      <header
        className={`flex justify-between items-start font-bold px-3 py-1 text-white`}
        style={{ backgroundColor: headerColor, fontFamily: "Lato,sans-serif" }}
      >
        <h3 className="line-clamp-3 flex-grow leading-[1.7]" title={title}>
          {title}
        </h3>
        {file && (
          <Tooltip content={line ? file + ", " + line : file} position="bottom">
            <button
              style={{
                backgroundColor: buttonColor,
              }}
              className={`relative flex text-sm items-center cursor-pointer px-2 py-1 rounded-full text-white max-w-[33%] ml-2 ${buttonHoverColor}`}
              onClick={() => handleLocate(file, line)}
              title={line ? file + ", " + line : file}
            >
              <ArIcon name={"LinkBold"} className="w-3 h-3" />
              <span
                className="pl-2 pr-1 overflow-hidden whitespace-nowrap text-ellipsis"
                style={{ direction: "rtl" }}
              >
                &#x202A;{line ? file + ", " + line : file}&#x202C;
              </span>
            </button>
          </Tooltip>
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
