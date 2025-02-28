import React, { useEffect, useState, useRef, useCallback } from "react";
import { set, useLayout } from "store";
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
  const [isFocus, setIsFocus] = useState(false);

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
    clearTimeout(typingTimeout.current) // 取消之前的定时器
    setIsTyping(true); // 用户开始输入
    typingTimeout.current = setTimeout(() => {
      setIsTyping(false); // 用户停止输入
    }, 1000);
    hintVersion.current += 1; // 版本控制，用于竞争请求
    if (hint !== "") {
      if (delta.action === "insert") {
        const newContent = delta.lines.join("\n");
        // 如果新输入的内容与hint前缀相同，则消除hint中的该部分
        if (hint.startsWith(newContent)) {
          // console.log("hint is starting with newContent");
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
  }, [hint]);

  useEffect(() => {
    // console.log("isTyping:", isTyping);
    if (hint === "" && !isTyping) {
        clearTimeout(debounceTimeout.current);
        if (!isFocus) return;
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
          const version = hintVersion.current; // 竞争版本控制
          // 调用 getAISuggestion 函数并处理返回的建议
          getAISuggestion(data, version);
      }, 1500);
    }
  }, [isTyping, hint, editor]);

  useEffect(() => {
    if (hint && !isTyping) {
      setHint("");
    }
  }, [hintPosition])

  const updateHintPosition = useCallback(() => {
    const cursorPosition = editor.getCursorPosition();
    const screenCoordinates = editor.renderer.textToScreenCoordinates(
      cursorPosition.row,
      cursorPosition.column
    );
    
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

  const handleBlur = useCallback(() => {
    setHint("");
    setIsFocus(false);
    clearTimeout(debounceTimeout.current);
    hintVersion.current += 1;
  }, []);

  useEffect(() => {
    addCustomCommand(editor);
    editor.session.on("change", handleChange);
    editor.session.selection.on("changeCursor", updateHintPosition);
    editor.on("focus", () => setIsFocus(true));
    editor.on("blur", handleBlur);

    return () => {
      editor.session.off("change", handleChange);
      editor.session.selection.on("changeCursor", updateHintPosition);
    };
  }, [editor, handleChange, addCustomCommand]);

  const getAISuggestion = async (data, version) => {
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
          setHint(suggestion?.endsWith("\n") ? suggestion : suggestion + "\n");
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