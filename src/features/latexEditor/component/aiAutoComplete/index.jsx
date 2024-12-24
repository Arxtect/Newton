import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLayout } from "store";

const AiAutoComplete = ({ editor }) => {
  const [hint, setHint] = useState("");
  const [hintPosition, setHintPosition] = useState({ top: 0, left: 0 });
  const sideWidthRef = useRef();
  const { sideWidth } = useLayout();

  const handleChange = useCallback(() => {
    const session = editor.getSession();
    const editorValue = session.getValue();

    if (editorValue.endsWith("session")) {
      setHint(" = editor.getSession();");
    } else {
      setHint("");
    }
  }, [editor]);

  const updateHintPosition = useCallback(() => {
    const cursorPosition = editor.getCursorPosition();
    const screenCoordinates = editor.renderer.textToScreenCoordinates(
      cursorPosition.row,
      cursorPosition.column
    );

    const editorElement = editor.container;
    const rect = editorElement.getBoundingClientRect();
    const lineNumberWidth = editor.renderer.gutterWidth; //显示行占用宽度

    const floatingTop = screenCoordinates.pageY - rect.top;
    console.log(
      "sideWidthRef.current",
      screenCoordinates,
      lineNumberWidth,
      sideWidthRef.current
    );
    const floatingLeft = screenCoordinates.pageX - sideWidthRef.current;

    setHintPosition({ top: floatingTop, left: floatingLeft });
  }, [editor]);

  const insertText = useCallback(() => {
    if (hint) {
      const session = editor.getSession();
      const cursor = editor.getCursorPosition();
      session.insert(cursor, hint);
      setHint("");
    }
  }, [hint, editor]);

  const addCustomCommand = useCallback(
    (editor) => {
      editor.commands.addCommand({
        name: "insertHint",
        bindKey: { win: "Tab", mac: "Tab" },
        exec: insertText,
      });
    },
    [insertText]
  );

  useEffect(() => {
    sideWidthRef.current = sideWidth;
  }, [sideWidth]);

  useEffect(() => {
    addCustomCommand(editor);
    editor.session.on("change", handleChange);
    editor.session.selection.on("changeCursor", updateHintPosition);

    return () => {
      editor.session.off("change", handleChange);
      editor.session.selection.on("changeCursor", updateHintPosition);
    };
  }, [editor, handleChange, addCustomCommand]);

  return (
    <>
      {hint && (
        <div
          style={{
            position: "absolute",
            top: hintPosition.top,
            left: hintPosition.left,
            pointerEvents: "none",
            color: "gray",
            opacity: "0.5",
            fontFamily: "monospace",
            fontSize: "14px",
            whiteSpace: "pre",
          }}
        >
          {hint}
        </div>
      )}
    </>
  );
};

export default React.memo(AiAutoComplete);
