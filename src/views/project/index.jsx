/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 13:48:03
 */
import React, { useRef, useEffect,useState} from "react";
import Slide from "./components/slide";
import Content from "./components/content";
import { getYDocToken } from "services";

const Project = () => {
  const contentRef = useRef(null);

  // slider menu
  const [currentSelectMenu, setCurrentSelectMenu] = useState("all");


  return (
    <div className="w-full flex  bg-white h-full overflow-hidden">
      <div className="flex flex-col w-1/5 h-full overflow-y-auto">
        <Slide contentRef={contentRef} currentSelectMenu={currentSelectMenu} setCurrentSelectMenu={setCurrentSelectMenu}></Slide>
      </div>
      <div className="flex flex-col w-4/5 px-8 h-full overflow-y-auto">
        <Content ref={contentRef} currentSelectMenu={currentSelectMenu} setCurrentSelectMenu={setCurrentSelectMenu}></Content>
      </div>
    </div>
  );
};

export default Project;
