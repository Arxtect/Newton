import React from "react";
import CommandInput from "./CommandInput";

const Command = () => {
  return (
    <div className="flex flex-col items-center justify-center ">
      <div className="w-full max-w-md">
        <div className="w-[28rem]">
          <CommandInput />
        </div>
      </div>
    </div>
  );
};

export default React.memo(Command);
