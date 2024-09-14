import React, { useState, useEffect, useRef } from "react";
import { Paper, List, ListItem } from "@mui/material";

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

const SearchWithSuggestions = () => {
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    // 自动打开菜单并聚焦输入框
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === "ArrowDown" && focusedIndex < commandOptions.length - 1) {
      setFocusedIndex(focusedIndex + 1);
    } else if (event.key === "ArrowUp" && focusedIndex > 0) {
      setFocusedIndex(focusedIndex - 1);
    }
  };

  return (
    <div>
      <div className="flex justify-center items-center w-full">
        <div className="relative w-full">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or question"
            className="w-full pl-12 pr-10 rounded-lg text-sm border-none shadow-lg focus:outline-none focus:ring-1 focus:ring-[#81c784] h-[2.4rem] flex items-center"
            style={{ display: "flex", alignItems: "center" }}
            onKeyDown={handleKeyDown}
          />
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-500 cursor-pointer">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/3a8f6fe48b60e23bcd440123fd980a657feba1b4f1a14e3465a06f70616f3fc8?apiKey=6856840afbf04beb865bb666a8346f6d&"
              className="object-contain shrink-0 w-6 aspect-square"
              alt=""
            />
          </button>
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/ba2826dfedc46423da960defd8b842203f5f4a4df7a2c0b590028eb88ffa3b9a?apiKey=6856840afbf04beb865bb666a8346f6d&"
              className="object-contain shrink-0 w-6 aspect-square"
              alt=""
            />
          </div>
        </div>
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
            <ListItem key={index} selected={index === focusedIndex}>
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
    </div>
  );
};

export default SearchWithSuggestions;
