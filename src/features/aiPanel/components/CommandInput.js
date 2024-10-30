import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import { Paper, List, ListItem } from "@mui/material";
import ChatInput from "@/features/aiTools/chat-input";
import Answer from "./answer";
import Button from "@/features/aiTools/button";
import ArIcon from "@/components/arIcon";

const IconList = {
  "9a1686f4-e641-474a-96c5-c6812908e046": "Text", // Newton General
  "22930441-0b94-4252-9db9-c05256550002": "Text", // Newton Selection Writing
  "23f33933-67f5-4a8c-9f94-be3265c7ffd9": "Equation", //Add An Equation
  "cc3378c3-dd99-4c9a-8a12-8f81e2e71acd": "Explain", //Section Polisher
  "3fe91c2b-0924-4080-82fb-47c4f6ee8929": "ChatTable", // Add An Table
};

export function getChatApiUrl() {
  return `/api/v1/chat/chat-messages`;
}

export function ShowLastChat({ chatList, isResponding, ...res }) {
  console.log(chatList, "chatList");
  return (
    <Paper
      elevation={3}
      sx={{
        backgroundColor: "white",
        borderRadius: 2,
      }}
      className="shadow-lg w-full px-4 pt-4 mt-[2px] max-h-[300px] overflow-auto"
    >
      {chatList.map((item, index) => {
        if (item.isAnswer) {
          const isLast = item.id === chatList[chatList.length - 1]?.id;
          return (
            <Answer
              key={item.id}
              item={item}
              question={chatList[index - 1]?.content}
              index={index}
              responding={isLast && isResponding}
              {...res}
            />
          );
        }
        return null;
      })}
    </Paper>
  );
}

const StopButton = ({ isResponding, handleStop }) => {
  return (
    isResponding && (
      <div
        className="group flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#EBF5FF] cursor-pointer"
        onClick={handleStop}
      >
        <ArIcon
          name="Stop"
          className={`w-5 h-5 text-black group-hover:text-primary-600`}
        />
      </div>
    )
  );
};

const CommandInput = forwardRef(
  (
    {
      chatList,
      isResponding,
      handleSend,
      handleRestart,
      handleStop,
      currentAppToken,
      currentApp,
      setCurrentApp,
      setDefaultApp,
      appList,
      incomeCommandOptions = [],
      triggerType,
      showPanel = null,
      isSelection = false,
      selectedContent,
      insertToEditor,
    },
    ref
  ) => {
    const [focusedIndex, setFocusedIndex] = useState(-1);
    const [hoveredIndex, setHoveredIndex] = useState(0);
    const [selectedCommand, setSelectedCommand] = useState(null);
    const inputRef = useRef(null);

    const [commandOptions, setCommandOptions] = useState([]);

    const [query, setQuery] = useState("");

    useEffect(() => {
      if (inputRef.current && showPanel == null) {
        inputRef.current.focus();
      }
      if (inputRef.current && showPanel) {
        // 自动打开菜单并聚焦输入框
        inputRef.current.focus();
      }
    }, [showPanel]);

    useEffect(() => {
      if (!appList || appList.length === 0) return;
      setCommandOptions(
        appList
          .map((item) => {
            if (item.default) {
              return null;
            }
            return {
              ...item,
              text: item.name,
              icon: IconList[item.id],
            };
          })
          .filter((item) => !!item)
      );
    }, [appList]);

    const filteredCommandOptions = React.useMemo(() => {
      let newCommandOptions = commandOptions;
      if (incomeCommandOptions.length > 0) {
        newCommandOptions = incomeCommandOptions;
      }

      if (!isSelection) {
        newCommandOptions = newCommandOptions.filter((item) => !item.selection);
      }

      if (!query || !query.trim()) return newCommandOptions;
      return newCommandOptions.filter((option) =>
        option.text.toLowerCase().includes(query.toLowerCase())
      );
    }, [query, commandOptions, incomeCommandOptions, isSelection]);

    const handleKeyDown = (event) => {
      if (focusedIndex !== -1 || filteredCommandOptions.length === 0) {
        return false;
      }
      if (
        event.key === "ArrowDown" &&
        hoveredIndex < commandOptions.length - 1
      ) {
        setHoveredIndex(hoveredIndex + 1);
        return true;
      } else if (event.key === "ArrowUp" && hoveredIndex > 0) {
        setHoveredIndex(hoveredIndex - 1);
        return true;
      } else if (
        event.key === "Enter" &&
        hoveredIndex >= 0 &&
        !event.shiftKey
      ) {
        handleSelect(hoveredIndex);
        return true;
      }
    };

    useEffect(() => {
      return () => {
        setDefaultApp();
        setSelectedCommand(null);
      };
    }, []);

    const handleSelect = (index) => {
      const option = filteredCommandOptions[index];
      if (option?.click) {
        option.click();
      } else {
        setFocusedIndex(index);
        setSelectedCommand(option);
        setCurrentApp(option);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    const handleSelectViaName = (name) => {
      const index = commandOptions.findIndex((item) => item.name === name);
      const option = commandOptions[index];
      if (option?.click) {
        option.click();
      } else {
        setFocusedIndex(index);
        setSelectedCommand(option);
        setCurrentApp(option);
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }
    };

    useImperativeHandle(ref, () => ({
      handleSelectViaName,
    }));

    const getUserInputsKeys = (currentApp) => {
      let user_input_form = currentApp?.user_input_form;
      if (!user_input_form) return;
      let input = user_input_form[0];
      let keys = input["text-input"] || input["paragraph"];
      if (!keys) return;
      let variable = keys.variable;
      return variable;
    };

    const onSend = useCallback(
      (message, files) => {
        handleRestart();
        // setSelectedCommand(null);
        setFocusedIndex(-1);
        setHoveredIndex(0);
        let key = getUserInputsKeys(currentApp);
        let inputs = key
          ? {
              [key]: selectedContent,
            }
          : {};
        const data = {
          query: message,
          inputs: inputs,
          conversation_id: "",
          response_mode: "streaming",
        };

        if (files?.length) data.files = files;

        handleSend(getChatApiUrl(), data, {
          currentAppToken,
        });
      },
      [currentAppToken, selectedContent]
    );

    const onHandleRestart = () => {
      handleSelect(-1);
      handleRestart();
      setDefaultApp();
    };

    return (
      <React.Fragment>
        <div className="flex justify-center items-center w-full">
          <ChatInput
            visionConfig={currentApp?.file_upload?.image}
            onSend={onSend}
            currentAppToken={currentAppToken}
            onKeyDown={handleKeyDown}
            onChangeQuery={setQuery}
            StopButton={() => StopButton({ isResponding, handleStop })}
            isResponding={isResponding}
            handleRestart={onHandleRestart}
            needNewChat={true}
            placeholder={selectedCommand?.text}
            inputRef={inputRef}
            currentApp={currentApp}
          />
        </div>
        {chatList.length > 1 && triggerType == "click" ? (
          <ShowLastChat
            chatList={chatList}
            isResponding={isResponding}
            insertToEditor={insertToEditor}
          ></ShowLastChat>
        ) : (filteredCommandOptions?.length &&
            !selectedCommand?.text &&
            !isResponding) ||
          (triggerType !== "click" &&
            incomeCommandOptions?.length > 0 &&
            !isResponding) ? (
          <Paper
            elevation={3}
            sx={{
              backgroundColor: "white",
              borderRadius: 2,
            }}
            className="shadow-lg w-[60%] px-2 py-1 mt-[2px] ai-list"
          >
            <List>
              {filteredCommandOptions.map((option, index) => (
                <ListItem
                  key={index}
                  selected={index === focusedIndex}
                  onClick={() => handleSelect(index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  sx={{
                    borderRadius: "10px",
                    backgroundColor:
                      index === hoveredIndex ? "#f0f0f0" : "inherit",
                  }}
                >
                  <div className="flex items-center space-x-3 h-5">
                    <ArIcon
                      loading="lazy"
                      name={option.icon}
                      alt={option.text}
                      className="object-contain shrink-0 w-6 h-5 aspect-square"
                    />
                    <span className="font-medium text-gray-900 h-full leading-6">
                      {option.text}
                    </span>
                  </div>
                </ListItem>
              ))}
            </List>
          </Paper>
        ) : null}
      </React.Fragment>
    );
  }
);
export default React.memo(CommandInput);
