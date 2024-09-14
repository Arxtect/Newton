/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-09-14 10:46:18
 */
import React from "react";
import CommandInput from "./CommandInput";
import CommandList from "./CommandList";

const AiPanel = () => {
  return (
    <main className="flex flex-col items-start text-sm font-medium leading-none text-center max-w-[502px]">
      <CommandInput />
      <CommandList />
    </main>
  );
};

export default AiPanel;
