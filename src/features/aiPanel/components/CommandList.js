import React from "react";
import CommandOption from "./CommandOption";

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

const CommandList = () => {
  return (
    <nav className="flex flex-col items-start px-7 py-5 mt-6 max-w-full text-black bg-white rounded-md shadow-[2px_2px_50px_rgba(0,0,0,0.25)] w-[214px] max-md:px-5">
      {commandOptions.map((option, index) => (
        <CommandOption key={index} icon={option.icon} text={option.text} />
      ))}
    </nav>
  );
};

export default CommandList;
