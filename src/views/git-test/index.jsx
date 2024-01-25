/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
// Hooks
import React, { useLayoutEffect } from "react";
import RootDirectory from "./components/RootDirectory"

const GitTest = () => {

  return (
    <main className="max-w-[99vw] m-[auto] mt-2">
      <RootDirectory
        // key={props.currentProjectRoot}
        // root={props.currentProjectRoot}
        // dirpath={props.currentProjectRoot}
        key={'/test'}
        root={'/test'}
        dirpath={'/test'}
        depth={0}
        open
      />
    </main>
  );
};

export default GitTest;
