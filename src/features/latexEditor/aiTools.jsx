import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLayout } from "store";
import AiPanel from "@/features/aiPanel";
import Ace from "ace-builds/src-min-noconflict/ace";
import "./aiTools.css"; // 引入样式文件

const Range = Ace.require("ace/range").Range;

const AiTools = ({ editor }) => {
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [showDropdown, setShowDropdown] = useState(false);
  const { sideWidth } = useLayout();
  const sideWidthRef = useRef();
  const [answerContent, setAnswerContent] = useState("");
  const [prevContentLength, setPrevContentLength] = useState(0);
  const [markerRange, setMarkerRange] = useState(null);

  const handleCommand = useCallback((content) => {
    if (content.length === 0) return;
    try {
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

        const newRange = new Range(
    range.start.row,
    range.start.column,
    range.start.row,
    range.start.column + content.length
  );

  const markerId = session.addMarker(newRange, "ace_selection", "text");
  setMarkerRange({ id: markerId, range: newRange });
  setShowDropdown(true);


      setShowDropdown(true);
    } catch (error) {
      console.error("Error handling command:", error);
    }
  },[editor]);

  const handleAccept = () => {
    if (markerRange) {
      editor.session.removeMarker(markerRange.id);
      setMarkerRange(null);
    }
  };

  const handleReject = () => {
    const session = editor.getSession();
    if (markerRange) {
      session.replace(markerRange.range, "");
      editor.session.removeMarker(markerRange.id);
      setMarkerRange(null);
    }
  };

  useEffect(() => {
    sideWidthRef.current = sideWidth;
  }, [sideWidth]);

  const handleCursorChange = (selection) => {
    const cursorPosition = editor.getCursorPosition();
    const screenCoordinates = editor.renderer.textToScreenCoordinates(
      cursorPosition.row,
      cursorPosition.column
    );
    const editorElement = editor.container;
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

  useEffect(() => {
    editor.session.selection.on("changeCursor", handleCursorChange);
    return () => {
      editor.session.selection.off("changeCursor", handleCursorChange);
    };
  }, []);

  useEffect(() => {
    if (!answerContent) {
      setPrevContentLength(0);
      return;
    }
    console.log("New content (JSON):", JSON.stringify(answerContent));



    const newContent = answerContent.slice(prevContentLength);

    const regex = /\{\s*$/;

    if (regex.test(newContent)) {
      return;
    }
  

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
