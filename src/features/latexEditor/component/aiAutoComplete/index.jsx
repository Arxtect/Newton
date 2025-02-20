import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLayout } from "store";
import { ssePost } from "./ssePost";
import { useFileStore } from "@/store/useFileStore";
import path from "path";


const AiAutoComplete = ({ editor }) => {
  const [hint, setHint] = useState("");
  const [hintPosition, setHintPosition] = useState({ top: 0, left: 0 });
  const [isTyping, setIsTyping] = useState(false);  // 用于判断用户是否在输入
  const sideWidthRef = useRef();
  const { sideWidth } = useLayout();

  const debounceTimeout = useRef(null);
  const typingTimeout = useRef(null);
  const hintVersion = useRef(0);

  const getCodeContext = (editor, cursorPosition) => {
    const session = editor.getSession();
  
    // 计算要提取的开始行（最多取20行）
    const startLine = Math.max(cursorPosition.row - 20, 0);
    const endLine = cursorPosition.row;  // 光标所在行
  
    // 提取从 startLine 到 endLine 之间的代码
    const contextLines = [];
    if (startLine > 0) contextLines.push("...");
    for (let i = startLine; i < endLine; i++) {
      contextLines.push(session.getLine(i));
    }
    contextLines.push(session.getLine(cursorPosition.row).slice(0, cursorPosition.column));
    // 返回拼接的上下文，合并成一个字符串
    return contextLines.join("\n");
  };

  const handleChange = useCallback((delta) => {
    if (!isTyping) {
      setIsTyping(true); // 用户开始输入
    } else {
      clearTimeout(typingTimeout.current); // 用户停止输入，清除定时器
    }
    if (hint !== "") {
      if (delta.action === "insert") {
        const newContent = delta.lines.join("\n");
        // 如果新输入的内容与hint前缀相同，则消除hint中的该部分
        if (hint.startsWith(newContent)) {
          const newHint = hint.slice(newContent.length);
          setHint(newHint);
        } else {
          setHint(""); // 输入内容与hint前缀不匹配，清除hint
        }
      } else {
        // 重新获取 hint
        setHint("");
      }
    }
  }, [editor, hint]);

  useEffect(() => {
    // console.log("isTyping:", isTyping);
    if (isTyping) {
      typingTimeout.current = setTimeout(() => {
        setIsTyping(false); // 用户停止输入
      }, 300);
    } else if (hint === "") {
        debounceTimeout.current = setTimeout(() => {
          const cursorPosition = editor.getCursorPosition();
          const currentFile = useFileStore.getState().selectedFiles;
          const fileName = path.basename(currentFile[0]);
          // console.log("fileName:", fileName);
          const message = getCodeContext(editor, cursorPosition);
          // console.log("message:", message);
          const data = {
            inputs: { currentContent: message, filename: fileName},
            reponse_mode: "blocking",
          };
          // 调用 getAISuggestion 函数并处理返回的建议
          getAISuggestion(data);
      }, 2000);
    }
  }, [isTyping, hint]);

  const updateHintPosition = useCallback(() => {
    const cursorPosition = editor.getCursorPosition();
    const screenCoordinates = editor.renderer.textToScreenCoordinates(
      cursorPosition.row,
      cursorPosition.column
    );
    // console.log("cursorPosition:", cursorPosition, "lastPosition:", lastChangRow, lastChangCol)
    if (!isTyping) {
      setHint("");  // 光标移动则清空 hint
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current); // 清除之前的定时器
      }
    }
    
    const editorElement = editor.container;
    const rect = editorElement.getBoundingClientRect();

    const floatingTop = screenCoordinates.pageY - rect.top;
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

  const getAISuggestion = async (data) => {
    // setHint("This is a test hint");
    const version = ++hintVersion.current; // 竞争版本控制，避免多次请求
    ssePost(
      `/api/v1/chat/auto-complete`,
      {
        body: data,
        headers: new Headers({
          "APP-Authorization": `Bearer vipUserToken`, // TODO: 之后需要添加身份认证，这里为第一重认证
        }),
      },
      {
        onSuccess: (suggestion) => {
          if (version !== hintVersion.current) return; // 忽略旧请求的响应
          setHint(suggestion)
        },
        onError: (err) => console.error("请求失败:", err)
      }
    );
  }
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