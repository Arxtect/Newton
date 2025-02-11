import React, { useEffect, useState, useRef, useCallback } from "react";
import { useLayout } from "store";
import { getChatAccessToken, getChatApp} from "@/services";
import { chatAccessToken, updateChatAccessToken, useUserStore } from "@/store";
import { ssePost } from "./ssePost";
import { useFileStore } from "@/store/useFileStore";
import path from "path";

const getAppList = async () => {
  const appList = await getChatApp();
  return appList;
}

const getAccessTokenAndStore = async (token) => {
  if (chatAccessToken[token]) return chatAccessToken[token];
  let accessToken = await getChatAccessToken(token);
  updateChatAccessToken(token, accessToken);
  return accessToken;
};

const AiAutoComplete = ({ editor }) => {
  const { accessToken } = useUserStore((state) => ({
    accessToken: state.accessToken,
  }));

  const [hint, setHint] = useState("");
  const [hintPosition, setHintPosition] = useState({ top: 0, left: 0 });
  const [isTyping, setIsTyping] = useState(false);  // 用于判断用户是否在输入
  const sideWidthRef = useRef();
  const { sideWidth } = useLayout();

  const [appList, setAppList] = useState([]);
  const [currentApp, setCurrentApp] = useState(null);
  const [currentAppToken, setCurrentAppToken] = useState(null);
  // 用于记录上一次输入的位置
  const [lastChangRow, setLastChangRow] = useState(0);
  const [lastChangCol, setLastChangCol] = useState(0);

  const [lastMessage, setLastMessage] = useState("");

  const handleGetAppList = useCallback(() => {
    if (!accessToken) return;
    getAppList().then((res) => {
      setAppList(res);
      setCurrentApp(res?.find((item) => item.default) || res?.[0]);
    });
  }, []);

  const setDefaultApp = useCallback(() => {
    setCurrentApp(appList.find((item) => item.default) || appList[0]);
  }, [appList]);

  const handleGetAccessToken = useCallback(async (token) => {
    let res = await getAccessTokenAndStore(token);
    setCurrentAppToken(res);
  }, []);

  useEffect(() => {
    if (!currentApp) return;
    console.log(currentApp, "currentApp");
    handleGetAccessToken(currentApp.access_token);
  }, [currentApp]);

  useEffect(() => {
    handleGetAppList();
  }, []);

  const debounceTimeout = useRef(null);

  const handleChange = useCallback(() => {
    const session = editor.getSession();
    const editorValue = session.getValue();

    const cursorPosition = editor.getCursorPosition();
    const lineText = session.getLine(cursorPosition.row);

    setLastChangRow(cursorPosition.row);
    setLastChangCol(cursorPosition.column);
    // console.log("changePosition:", cursorPosition)
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current); // 清除之前的定时器
    }

    setIsTyping(true);
    // 如果新输入的字符与 hint 第一个字符一致，就删除hint的第一个字符
    if (hint && ((cursorPosition.column === 0 && hint[0] === "\n") ||
      (cursorPosition.column > 0 && lineText[cursorPosition.column] === hint[0])
    )) {
      setHint(hint.slice(1));
    } else { // 否则，重新获取 hint
      setHint("");
      debounceTimeout.current = setTimeout(() => {
        setIsTyping(false); // 用户停止输入
        const currentFile = useFileStore.getState().selectedFiles;
        const fileName = path.basename(currentFile[0]);
        console.log("fileName:", fileName);
        const message = editorValue; // TODO: 这里需要设置成简要的上下文内容，需要修改
        console.log("message:", message);
        const data = {
          inputs: { currentContent: message, filename: fileName},
          reponse_mode: "blocking",
        };
        // 调用 getAISuggestion 函数并处理返回的建议
        getAISuggestion(data);
      }, 500);  // 延迟 0.5 秒后调用 getAISuggestion
    }
  }, [editor, hint]);

  const updateHintPosition = useCallback(() => {
    const cursorPosition = editor.getCursorPosition();
    const screenCoordinates = editor.renderer.textToScreenCoordinates(
      cursorPosition.row,
      cursorPosition.column
    );
    // console.log("cursorPosition:", cursorPosition, "lastPosition:", lastChangRow, lastChangCol)
    if (lastChangCol !== cursorPosition.column - 1 || !isTyping) {
      setHint("");  // 光标移动则清空 hint
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current); // 清除之前的定时器
      }
    }
    
    const editorElement = editor.container;
    const rect = editorElement.getBoundingClientRect();
    const lineNumberWidth = editor.renderer.gutterWidth; //显示行占用宽度

    const floatingTop = screenCoordinates.pageY - rect.top;
    const floatingLeft = screenCoordinates.pageX - sideWidthRef.current;

    setHintPosition({ top: floatingTop, left: floatingLeft });
  }, [editor, lastChangRow, lastChangCol]);

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
    ssePost(
      `/api/v1/chat/auto-complete`,
      {
        body: data,
        headers: new Headers({
          "APP-Authorization": `Bearer ${currentAppToken}`,
        }),
      },
      {
        onSuccess: (data) => setHint(data.outputs.suggestion),
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
