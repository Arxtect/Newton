import { typeset, loadExtensions } from "./math";
import React, { useEffect, useState } from "react";

const TexMathJax = ({ latexRef }) => {
  const [svgOutput, setSvgOutput] = useState("");
  const [hoveredLine, setHoveredLine] = useState(null);

  const renderMath = (latex) => {
    try {
      const svg = typeset(latex, { scale: 1, color: "black" });
      setSvgOutput(svg);
    } catch (error) {
      console.error("Error rendering LaTeX:", error);
    }
  };

  const handleMouseMove = (e) => {
    const editor = latexRef.current.editor;
    const { row } = editor.renderer.screenToTextCoordinates(
      e.clientX,
      e.clientY
    );
    const lineCount = editor.session.getLength();
    let lineContent = editor.session.getLine(row);

    if (lineContent.includes("\\begin{equation}")) {
      let equationContent = lineContent;
      let currentRow = row + 1;

      while (currentRow < lineCount) {
        const nextLine = editor.session.getLine(currentRow);
        equationContent += "\n" + nextLine;
        if (nextLine.includes("\\end{equation}")) {
          break;
        }
        currentRow++;
      }

      if (equationContent.includes("\\end{equation}")) {
        setHoveredLine(row);
        renderMath(equationContent);
      } else {
        setHoveredLine(null);
        setSvgOutput("");
      }
    } else {
      setHoveredLine(null);
      setSvgOutput("");
    }
  };

  useEffect(() => {
    if (!latexRef.current || !latexRef.current.editor) return;
    const editor = latexRef.current.editor;
    editor.on("mousemove", handleMouseMove);
    return () => {
      editor.off("mousemove", handleMouseMove);
    };
  }, [latexRef]);

  const calculateTopPosition = (latexRef, hoveredLine) => {
    const editor = latexRef.current.editor;
    const lineHeight = editor.renderer.lineHeight;
    const scrollTop = editor.renderer.scrollTop;
    let screenPos = editor.session.documentToScreenPosition(hoveredLine, 0);
    return screenPos.row * lineHeight - scrollTop;
  };

  const calculateLeftPosition = (latexRef) => {
    const editor = latexRef.current.editor;
    const gutterWidth = editor.renderer.gutterWidth;
    return gutterWidth + 5;
  };

  const shouldPositionAbove = (latexRef, hoveredLine) => {
    const editor = latexRef.current.editor;
    const firstVisibleLine = Math.floor(
      editor.renderer.scrollTop / editor.renderer.lineHeight
    );
    return hoveredLine - firstVisibleLine > 5;
  };

  return (
    hoveredLine !== null && (
      <div
        className="absolute bg-[#fafafa] px-5 py-2 text-black z-50"
        style={{
          border: "1px solid #ccc",
          borderRadius: "5px",
          top: `${calculateTopPosition(latexRef, hoveredLine)}px`,
          left: `${calculateLeftPosition(latexRef)}px`,
          transform: shouldPositionAbove(latexRef, hoveredLine)
            ? "translateY(-100%)"
            : `translateY(${latexRef?.current?.editor.renderer.lineHeight}px)`,
        }}
        dangerouslySetInnerHTML={{ __html: svgOutput }}
      />
    )
  );
};

export { TexMathJax, loadExtensions };
