import * as React from "react";
import Slide from "./components/slide"
import Content from "./components/content"

const Project = () => {
    return (
        <div className="flex  bg-white h-full overflow-hidden">
            <div className="flex flex-col w-1/5 h-full overflow-y-auto">
                <Slide></Slide>
            </div>
            <div className="flex flex-col w-4/5 px-8 h-full overflow-y-auto">
                <Content></Content>
            </div>
        </div>
    );
}

export default Project