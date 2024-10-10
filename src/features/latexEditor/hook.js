import { useEffect, useRef, useState } from "react";
import { compileLatex } from "@/features/latexCompilation/latexCompilation";
import * as constant from "@/constant";
import { useCompileSetting, useEngineStatusStore } from "@/store";

function useAutoCompile(sourceCode, currentProjectRoot, filepath) {
  const timerRef = useRef();

  const { engineStatus, isTriggerCompile, setIsTriggerCompile } =
    useEngineStatusStore();
  const { compileSetting } = useCompileSetting();

  const [isFirstCompile, setIsFirstCompile] = useState(true);

  useEffect(() => {
    if (!compileSetting["autoCompile"] || !currentProjectRoot || !filepath)
      return;

    if (isFirstCompile && engineStatus === constant.readyEngineStatus) {
      compileLatex(currentProjectRoot, filepath, compileSetting);
      setIsFirstCompile(false);
      return;
    }

    if (isFirstCompile) {
      return;
    }

    if (!isTriggerCompile) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      compileLatex(currentProjectRoot, filepath, compileSetting);
      setIsTriggerCompile(false);
    }, 3000);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [
    filepath,
    engineStatus,
    currentProjectRoot,
    compileSetting,
    isTriggerCompile,
  ]);
}

export default useAutoCompile;
