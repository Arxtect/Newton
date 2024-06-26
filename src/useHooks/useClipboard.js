/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-06-26 14:37:08
 */
/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-06-26 14:37:08
 */
import { useEffect, useState } from "react";

const useClipboard = () => {
  const [projectName, setProjectName] = useState("");
  const [roomId, setRoomId] = useState("");

  const readClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
      return null;
    }
  };

  const parseClipboardText = (text) => {
    const urlParams = new URLSearchParams(text);
    return {
      project: urlParams.get("project"),
      roomId: urlParams.get("roomId"),
    };
  };

  const handleNewClipboardContent = (newParams) => {
    if (
      newParams.project &&
      newParams.roomId &&
      (newParams.project !== projectName || newParams.roomId !== roomId)
    ) {
      const confirmed = window.confirm(
        `Whether to enter the collaboration project：${newParams.project}`
      );
      if (confirmed) {
        setProjectName(newParams.project);
        setRoomId(newParams.roomId);
        // 执行进入协作项目的逻辑，比如导航到新的页面
      }
    }
  };

  useEffect(() => {
    const checkClipboard = async () => {
      const clipboardContent = await readClipboard();
      if (clipboardContent) {
        const newParams = parseClipboardText(clipboardContent);
        handleNewClipboardContent(newParams);
      }
    };

    // 初次加载时检查剪贴板内容
    checkClipboard();

    // 页面重新聚焦时检查剪贴板内容
    const handleFocus = () => {
      checkClipboard();
    };

    window.addEventListener("focus", handleFocus);

    // 组件卸载时清理事件监听器
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [projectName, roomId]);

  const clearProjectInfo = () => {
    setProjectName("");
    setRoomId("");
  };

  return { projectName, roomId, clearProjectInfo };
};

export default useClipboard;
