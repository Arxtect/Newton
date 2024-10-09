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
import "./index.css"; // 引入样式文件
import SelectionTooltip from "./SelectionTooltip";
import AiConfirm from "../aiConfirm";
import { useChatStore } from "@/store";

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
  const [showTooltip, setShowTooltip] = useState(false);

  const [isSelection, setIsSelection] = useState(false);

  const [incomeCommandOptions, setIncomeCommandOptions] = useState([]);

  const [selectedContent, setSelectedContent] = useState("");

  const { showPromptMessage, saveHandleAccept, saveHandleReject } =
    useChatStore();

  //commandInput
  const commandInputRef = useRef();

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
        icon: "Accept",
        click: handleAccept,
      },
      {
        text: "Discard",
        icon: "Discard",
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

        let range = editor.getSelectionRange();

        if (isSelection && !markerRange) {
          let insertPosition = {
            row: range.end.row,
            column: range.end.column,
          };
          editor.moveCursorToPosition(insertPosition);
          editor.session.replace(
            {
              start: insertPosition,
              end: insertPosition,
            },
            "\n"
          );
          range = editor.getSelectionRange();
          insertPosition = {
            row: range.end.row,
            column: range.end.column,
          };

          range = {
            start: insertPosition,
            end: insertPosition,
          };
          editor.moveCursorToPosition(insertPosition);
        }

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
    [editor, markerRange, isSelection]
  );

  const setCurrentPosition = (cursorPosition, session) => {
    const screenCoordinates = editor.renderer.textToScreenCoordinates(
      cursorPosition.row,
      0 //使用0替换cursorPosition.column
    );
    const visualLineCount = session.getRowLength(cursorPosition.row);

    const editorElement = editor.container;
    const rect = editorElement.getBoundingClientRect();
    const toolbarTop =
      screenCoordinates.pageY +
      editor.renderer.layerConfig.lineHeight * visualLineCount -
      rect.top +
      3;
    const toolbarLeft = screenCoordinates.pageX - sideWidthRef.current;
    setToolbarPosition({ top: toolbarTop, left: toolbarLeft });
  };

  const handleCursorChange = () => {
    if (markerRange && !isResponding) {
      setShowDropdown(true);
      return;
    }
    const session = editor.getSession();
    const range = editor.getSelectionRange();
    const selectText = editor.getSelectedText();
    const cursorPosition = range.isEmpty()
      ? editor.getCursorPosition()
      : range.end;

    console.log(selectText, "selectText");

    if (selectText?.length > 1 && selectText.trim() != "") {
      setShowTooltip(true);
    } else {
      setShowTooltip(false);
    }

    setCurrentPosition(cursorPosition, session);
    handleShowDropdown(cursorPosition, session);
  };

  const handleShowDropdown = (cursorPosition, session) => {
    const line = session.getLine(cursorPosition.row);
    const previousChar = line.charAt(cursorPosition.column - 1);
    const previousChar2 = line.charAt(cursorPosition.column - 2);

    if (previousChar === "/" && previousChar2 !== "/") {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleChange = () => {
    const session = editor.getSession();
    const cursorPosition = editor.getCursorPosition();
    handleShowDropdown(cursorPosition, session);
  };

  const handleSelectViaName = (name = "Newton Selection Writing") => {
    //Section Polisher
    if (commandInputRef.current) {
      commandInputRef.current.handleSelectViaName(name);
    }
  };

  const addCustomCommand = (editor) => {
    editor.commands.addCommand({
      name: "showCustomComponent",
      bindKey: { win: "Ctrl-I", mac: "Cmd-I" },
      exec: () => {
        const selectedText = editor.getSelectedText();
        setShowTooltip(false);
        if (!selectedText) return;
        setIsSelection(true);
        handleSelectViaName("Newton Selection Writing");
        setShowDropdown(true);
        setSelectedContent(selectedText);
      },
    });
  };

  const insertTextToEditor = () => {
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
  };

  const handleClickOutside = (event) => {
    // 检查点击是否在特定区域外
    if (
      markerRange &&
      !event.target.closest(".prompt-container") &&
      !event.target.closest(".toolbar")
    ) {
      showPromptMessage();
      saveHandleAccept(handleAccept);
      saveHandleReject(handleReject);
      editor.blur();
      event.stopPropagation();
    }
  };

  useEffect(() => {
    insertTextToEditor();
  }, [answerContent, handleCommand, isResponding]);

  useEffect(() => {
    if (!showDropdown) {
      handleReject();
      setIncomeCommandOptions([]);
      editor.focus();
      completer && completer.enable();
      setIsSelection(false);
    } else {
      completer && completer.disable();
    }
  }, [showDropdown]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    addCustomCommand(editor);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      handleReject();
    };
  }, []);

  useEffect(() => {
    sideWidthRef.current = sideWidth;
  }, [sideWidth]);

  useEffect(() => {
    editor.session.selection.on("changeCursor", handleCursorChange);
    editor.session.on("change", handleChange);
    document.addEventListener("click", handleClickOutside, true); // 使用捕获阶段

    return () => {
      editor.session.selection.off("changeCursor", handleCursorChange);
      editor.session.off("change", handleChange);
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [markerRange, showPromptMessage, isResponding]);

  return (
    <React.Fragment>
      <div
        className="toolbar"
        style={{
          position: "absolute",
          top: toolbarPosition.top,
          left: toolbarPosition.left,
          visibility: showDropdown ? "visible" : "hidden",
          zIndex: 99,
        }}
      >
        <AiPanel
          triggerType="show"
          setAnswerContent={setAnswerContent}
          incomeCommandOptions={incomeCommandOptions}
          setIsResponding={setIsResponding}
          showPanel={showDropdown}
          commandInputRef={commandInputRef}
          isSelection={isSelection}
          selectedContent={selectedContent}
        />
      </div>
      {showTooltip && (
        <SelectionTooltip
          message={"Ctrl/Command + I  AI Command"}
          position={toolbarPosition}
        />
      )}
      <AiConfirm />
    </React.Fragment>
  );
};

export default React.memo(AiTools);
