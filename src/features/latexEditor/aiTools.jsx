import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useLayout } from "store";
import AiPanel from "@/features/aiPanel";
import Ace from "ace-builds/src-min-noconflict/ace";
import "./aiTools.css"; // 引入样式文件

import acceptIcon from "@/assets/chat/accept.svg";
import discardIcon from "@/assets/chat/discard.svg";

const Range = Ace.require("ace/range").Range;

const AiTools = ({ editor, completer }) => {
  const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
  const [showDropdown, setShowDropdown] = useState(false);
  const { sideWidth } = useLayout();
  const sideWidthRef = useRef();
  const [answerContent, setAnswerContent] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [prevContentLength, setPrevContentLength] = useState(0);
  const [markerRange, setMarkerRange] = useState(null);

  const [incomeCommandOptions, setIncomeCommandOptions] = useState([]);

  const handleAccept = useCallback(() => {
    if (markerRange) {
      editor.session.removeMarker(markerRange.id);
      setMarkerRange(null);
    }
    setShowDropdown(false);
  }, [markerRange]);

  const handleReject = useCallback(() => {
    const session = editor.getSession();
    if (markerRange) {
      session.replace(markerRange.range, "");
      editor.session.removeMarker(markerRange.id);
      setMarkerRange(null);
    }
    setShowDropdown(false);
  }, [markerRange]);

  const incomeCommandOptionsCallback = useMemo(() => {
    return [
      {
        text: "Accept",
        icon: acceptIcon,
        click: handleAccept,
      },
      {
        text: "Discard",
        icon: discardIcon,
        click: handleReject,
      },
    ];
  }, [handleReject, handleAccept]);

  const handleCommand = useCallback(
    (content) => {
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
        editor.session.replace(range, content);

        // 计算新内容的行数和列数
        const lines = content.split("\n");
        const newEndRow = range.start.row + lines.length - 1;
        const newEndColumn =
          lines.length === 1
            ? range.start.column + content.length
            : lines[lines.length - 1].length;

        let newRange;
        if (markerRange) {
          // 扩展现有的范围
          newRange = new Range(
            markerRange.range.start.row,
            markerRange.range.start.column,
            newEndRow,
            newEndColumn
          );
          session.removeMarker(markerRange.id);
        } else {
          // 创建新的范围
          newRange = new Range(
            range.start.row,
            range.start.column,
            newEndRow,
            newEndColumn
          );
        }

        const markerId = session.addMarker(newRange, "ai-marker", "text");
        setMarkerRange({ id: markerId, range: newRange });
        setShowDropdown(true);
      } catch (error) {
        console.error("Error handling command:", error);
      }
    },
    [editor, markerRange]
  );

  useEffect(() => {
    sideWidthRef.current = sideWidth;
  }, [sideWidth]);

  const handleCursorChange = (selection) => {
    const cursorPosition = editor.getCursorPosition();
    const screenCoordinates = editor.renderer.textToScreenCoordinates(
      cursorPosition.row,
      0
      // cursorPosition.column
    );
    const editorElement = editor.container;
    const rect = editorElement.getBoundingClientRect();
    const toolbarTop =
      screenCoordinates.pageY +
      editor.renderer.layerConfig.lineHeight -
      rect.top +
      3;
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
      handleReject();
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
    if (isResponding) {
      setIncomeCommandOptions(incomeCommandOptionsCallback);
    }
  }, [answerContent, handleCommand, isResponding]);

  useEffect(() => {
    if (!showDropdown) {
      handleReject();
      setIncomeCommandOptions([]);
      editor.focus();
      completer && completer.enable();
    } else {
      completer && completer.disable();
    }
  }, [showDropdown]);

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
        <AiPanel
          triggerType="show"
          setAnswerContent={setAnswerContent}
          incomeCommandOptions={incomeCommandOptions}
          setIsResponding={setIsResponding}
        />
      </div>
    )
  );
};

export default React.memo(AiTools);
