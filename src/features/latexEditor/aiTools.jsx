import React, { useEffect, useState, useRef } from "react";
import { useLayout } from "store";
import AiPanel from "@/features/aiPanel";
import Ace from "ace-builds/src-min-noconflict/ace";
import "./aiTools.css"; // 引入样式文件

const Range = Ace.require("ace/range").Range;

const AiTools = ({ editorRef }) => {
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [showDropdown, setShowDropdown] = useState(false);
  const { sideWidth } = useLayout();
  const sideWidthRef = useRef();
  const [answerContent, setAnswerContent] = useState("");
  const [prevContentLength, setPrevContentLength] = useState(0);
  const [markerRange, setMarkerRange] = useState(null);

  const handleCommand = (content) => {
    if (content.length === 0) return;
    try {
      const editor = editorRef.current.editor;
      const cursorPosition = editor.getCursorPosition();
      const session = editor.getSession();
      const line = session.getLine(cursorPosition.row);
      const previousChar = line.charAt(cursorPosition.column - 1);

      if (previousChar === "/") {
        editor.moveCursorToPosition({
          row: cursorPosition.row,
          column: cursorPosition.column - 1,
        });
        editor.session.replace(
          {
            start: {
              row: cursorPosition.row,
              column: cursorPosition.column - 1,
            },
            end: { row: cursorPosition.row, column: cursorPosition.column },
          },
          ""
        );
      }

      const range = editor.getSelectionRange();
      console.log(content, 'content');
      editor.session.replace(range, content);

      setShowDropdown(true);
    } catch (error) {
      console.error("Error handling command:", error);
    }
  };

  const handleAccept = () => {
    // const editor = editorRef.current.editor;
    // if (markerRange) {
    //   editor.session.removeMarker(markerRange.id);
    //   setMarkerRange(null);
    // }
  };

  const handleReject = () => {
    // const editor = editorRef.current.editor;
    // const session = editor.getSession();
    // if (markerRange) {
    //   session.replace(markerRange.range, "");
    //   editor.session.removeMarker(markerRange.id);
    //   setMarkerRange(null);
    // }
  };

  useEffect(() => {
    sideWidthRef.current = sideWidth;
  }, [sideWidth]);

  const handleCursorChange = (selection) => {
    const editor = editorRef.current.editor;
    const cursorPosition = editor.getCursorPosition();
    const screenCoordinates = editor.renderer.textToScreenCoordinates(
      cursorPosition.row,
      cursorPosition.column
    );
    const editorElement = editorRef.current.editor.container;
    const rect = editorElement.getBoundingClientRect();
    const toolbarTop =
      screenCoordinates.pageY +
      editor.renderer.layerConfig.lineHeight -
      rect.top;
    const toolbarLeft = screenCoordinates.pageX - sideWidthRef.current;
    setToolbarPosition({ top: toolbarTop, left: toolbarLeft });

    const session = editor.getSession();
    const line = session.getLine(cursorPosition.row);
    const previousChar = line.charAt(cursorPosition.column - 1);
    const previousChar2 = line.charAt(cursorPosition.column - 2);

    if (previousChar === "/" && previousChar2 !== "/") {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleInput = (event) => {
    const editor = editorRef.current.editor;
    const session = editor.getSession();
    const cursorPosition = editor.getCursorPosition();
    const line = session.getLine(cursorPosition.row);
    const beforeCursor = line.slice(0, cursorPosition.column);

    // 检查是否输入了 \begin 或 \end
    if (beforeCursor.endsWith('\\begin') || beforeCursor.endsWith('\\end')) {
      // 在光标后面添加一个空格
      editor.session.insert(cursorPosition, ' ');
    }
  };

  useEffect(() => {
    const editor = editorRef.current.editor;
    editor.session.selection.on("changeCursor", handleCursorChange);
    editor.on('input', handleInput);
    return () => {
      editor.session.selection.off("changeCursor", handleCursorChange);
      editor.off('input', handleInput);
    };
  }, []);

  useEffect(() => {
    if (!answerContent) {
      setPrevContentLength(0);
      return;
    }

    const newContent = answerContent.slice(prevContentLength);
    handleCommand(newContent);
    setPrevContentLength(answerContent.length);
  }, [answerContent]);

  return (
    showDropdown && (
      <div
        className="toolbar"
        style={{
          position: "absolute",
          top: toolbarPosition.top,
          left: toolbarPosition.left,
        }}
      >
        <AiPanel triggerType="show" setAnswerContent={setAnswerContent} />
        <button onClick={handleAccept}>Accept</button>
        <button onClick={handleReject}>Reject</button>
      </div>
    )
  );
};

export default React.memo(AiTools);
