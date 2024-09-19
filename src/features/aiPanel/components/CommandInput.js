import React, { useState, useEffect, useRef, useCallback } from "react";
import { Paper, List, ListItem } from "@mui/material";
import ChatInput from "@/features/aiTools/chat-input";
import { useChat } from "@/features/aiTools/hook";
import { stopChat as stopChatApi } from "@/services";
import { useUserStore } from "store";

const commandOptions = [
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/4408eb37d00bed948a0e92d9b6afc46cef419539718b7543e03b68110d0c5164?apiKey=6856840afbf04beb865bb666a8346f6d&",
    text: "Title Generator",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/1e8c21590e7f0c48829068e6c62de3cf3ebd5532f1a32cae94b97b2932156f16?apiKey=6856840afbf04beb865bb666a8346f6d&",
    text: "Abstract Generator",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/8a487349785d16dfac3babbc2d52c61e30d56d9560811d203d6f265bec1093b3?apiKey=6856840afbf04beb865bb666a8346f6d&",
    text: "Paraphrase",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/7138ca3fd7867999a86bf42a6a879099aaa1ddefd0580aa8dde8921a72be29d5?apiKey=6856840afbf04beb865bb666a8346f6d&",
    text: "Change style",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/4a6e6f1faa1b2b70a237c3482db2998eb16320b348f0919b1a68290c305a0780?apiKey=6856840afbf04beb865bb666a8346f6d&",
    text: "Split / Join",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/590ac830abcf7caf0281537f9811cc05fb9a58ec5c257994c04ab7996e058bab?apiKey=6856840afbf04beb865bb666a8346f6d&",
    text: "Summarize",
  },
  {
    icon: "https://cdn.builder.io/api/v1/image/assets/TEMP/b9e14bc4af28416817f2adaa419ffdcca21fd7c6b1a056e47220352c16dee92a?apiKey=6856840afbf04beb865bb666a8346f6d&",
    text: "Explain",
  },
];

export function getChatApiUrl() {
  return `/api/v1/chat/chat-messages`;
}

const SearchWithSuggestions = () => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [selectedCommand, setSelectedCommand] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // 自动打开菜单并聚焦输入框
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown" && hoveredIndex < commandOptions.length - 1) {
      setHoveredIndex(hoveredIndex + 1);
    } else if (event.key === "ArrowUp" && hoveredIndex > 0) {
      setHoveredIndex(hoveredIndex - 1);
    } else if (event.key === "Enter" && hoveredIndex >= 0) {
      handleSelect(hoveredIndex);
    }
    if (selectedCommand) {
      return false;
    }
    return true;
  };

  const handleSelect = (index) => {
    setFocusedIndex(index);
    setSelectedCommand(commandOptions[index]);
    console.log("Selected command:", commandOptions[index]);
  };

  const stopChat = async (taskId, currentAppToken) => {
    console.log(`Stop chat with taskId: ${taskId}`);
    await stopChatApi(taskId, currentAppToken);
  };

  const {
    isResponding,
    setIsResponding,
    handleSend,
    handleRestart,
    handleStop,
    currentAppToken,
    currentApp,
  } = useChat(null, stopChat);

  const onSend = useCallback(
    (message, files) => {
      const data = {
        query: message,
        inputs: {},
        conversation_id: "",
        response_mode: "streaming",
      };

      if (files?.length) data.files = files;

      handleSend(getChatApiUrl(), data, {
        currentAppToken,
      });
    },
    [currentAppToken]
  );

  return (
    <React.Fragment>
      <div className="flex justify-center items-center w-full">
        <ChatInput
          visionConfig={currentApp?.file_upload?.image}
          onSend={onSend}
          currentAppToken={currentAppToken}
          onKeyDown={handleKeyDown}
        />
      </div>
      <Paper
        elevation={3}
        sx={{
          marginTop: 1,
          backgroundColor: "white",
          borderRadius: 2,
        }}
        className="shadow-lg w-[60%] px-2 py-1"
      >
        <List>
          {commandOptions.map((option, index) => (
            <ListItem
              key={index}
              selected={index === focusedIndex}
              onClick={() => handleSelect(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(-1)}
              sx={{
                backgroundColor: index === hoveredIndex ? "#f0f0f0" : "inherit",
              }}
            >
              <div className="flex items-center space-x-3">
                <img
                  loading="lazy"
                  src={option.icon}
                  alt={option.text}
                  className="object-contain shrink-0 w-6 aspect-square"
                />
                <span className="font-medium text-gray-900">{option.text}</span>
              </div>
            </ListItem>
          ))}
        </List>
      </Paper>
    </React.Fragment>
  );
};

export default React.memo(SearchWithSuggestions);
