/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
// Hooks
import React, { useLayoutEffect } from "react";
import FileSystem from "./file_system";

const useGit = () => {
  const git = React.useMemo(() => {}, []);
  return git;
};

const GitTest = () => {
  const debug = (git) => {};
  const [fileName, setFileName] = React.useState("hello.js");
  const git = useGit();
  const [text, setText] = React.useState("");
  const [fs, setFS] = React.useState(debug(git));
  const fileChange = React.useCallback(
    (fileName) => {
      const data = git.read(fileName);
      setText(new TextDecoder().decode(data));
      setFileName(fileName);
    },
    [setText, setFileName]
  );
  const createFile = React.useCallback(
    (fileName) => {
      git.write(fileName, "");
      setText("");
      setFileName(fileName);
      setFS(debug(git));
    },
    [git, setText, setFileName]
  );
  // The actual app
  return (
    <main className="max-w-[99vw] m-[auto] mt-2">
      <FileSystem
        className="w-1/5 h-screen overflow-scroll"
        fs={fs}
        onClick={fileChange}
        currentFile={fileName}
        onCreateFile={createFile}
      />
    </main>
  );
};

export default GitTest;
