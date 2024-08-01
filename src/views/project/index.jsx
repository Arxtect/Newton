import React, { useRef } from "react";
import Slide from "./components/slide";
import Content from "./components/content";

const Project = () => {
  const contentRef = useRef(null);
  return (
    <div className="w-full flex  bg-white h-full overflow-hidden">
      <div className="flex flex-col w-1/5 h-full overflow-y-auto">
        <Slide contentRef={contentRef}></Slide>
      </div>
      <div className="flex flex-col w-4/5 px-8 h-full overflow-y-auto">
        <Content ref={contentRef}></Content>
      </div>
    </div>
  );
};

export default Project;
