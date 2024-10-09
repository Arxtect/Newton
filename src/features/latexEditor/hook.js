import { useEffect, useRef, useState } from "react";
import { compileLatex } from "@/features/latexCompilation/latexCompilation";
import * as constant from "@/constant";
import { useCompileSetting, useEngineStatusStore } from "@/store";

function useAutoCompile(sourceCode, currentProjectRoot, filepath) {
  const timerRef = useRef();
  const previousSourceCodeRef = useRef(sourceCode);

  const { engineStatus } = useEngineStatusStore();
  const { compileSetting } = useCompileSetting();

  const [isFirstCompile, setIsFirstCompile] = useState(true);

  useEffect(() => {
    if (!compileSetting["autoCompile"] || !currentProjectRoot) return;

    if (
      isFirstCompile &&
      engineStatus === constant.readyEngineStatus &&
      sourceCode
    ) {
      compileLatex(sourceCode, currentProjectRoot, filepath, compileSetting);
      setIsFirstCompile(false);
      return;
    }

    if (isFirstCompile) {
      return;
    }

    if (sourceCode === previousSourceCodeRef.current) return;

    previousSourceCodeRef.current = sourceCode;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      if (sourceCode) {
        compileLatex(sourceCode, currentProjectRoot, filepath, compileSetting);
      }
    }, 3000);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [sourceCode, engineStatus, currentProjectRoot, compileSetting]);
}

export default useAutoCompile;
