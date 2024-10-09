import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import "./layout.scss";
import { useLayout } from "store";
import { useReactive } from "ahooks";
import { useFileStore, revokeCompiledPdfUrl, setCompilerLog } from "store";
import dotsLine from "@/assets/dots-line.svg";
import rightLine from "@/assets/right-line.svg";
import leftLine from "@/assets/left-line.svg";

const Layout = ({
  header,
  footer,
  left,
  content,
  preview,
  terminal,
  rightBefore,
  rightBeforeRight,
}) => {
  const {
    showView,
    showXterm,
    showSide,
    showEditor,
    presentation,
    showHeader,

    toggleSide,
    toggleXterm,
    toggleEditor,
    toggleView,
    emitResize,
    showFooter,
    setSideWidth,
    sideWidth,
    setWillResizing,
  } = useLayout();

  // Refs for DOM elements
  const asideRef = useRef(null);
  const editorRef = useRef(null);
  const terminalRef = useRef(null);
  const contentRef = useRef(null);

  // Resizing logic state
  // const [resizeOrigin, setResizeOrigin] = useState(null);
  const reactive = useReactive({ resizeOrigin: null });

  useEffect(() => { }, [reactive.resizeOrigin]);

  const resizeOutOfRange = (refName, outOfRange) => {
    if (refName === "aside" && outOfRange === "min") {
      toggleSide(false);
      return true;
    }

    if (refName === "terminal" && outOfRange === "min") {
      toggleXterm(false);
      return true;
    }

    if (refName === "editor") {
      if (outOfRange === "min") {
        toggleEditor(false);
      } else if (outOfRange === "max") {
        toggleView(false);
      }

      return false;
    }

    return false;
  };

  // Helper functions for resizing logic
  const getContainerSibling = (ref, resizeOrigin) => {
    return resizeOrigin.type === "right"
      ? ref.current?.nextElementSibling
      : ref.current?.previousElementSibling;
  };

  const clearResize = () => {
    if (reactive.resizeOrigin) {
      const ref = {
        aside: asideRef,
        editor: editorRef,
        terminal: terminalRef,
      }[reactive.resizeOrigin.ref].current;

      ref.style.filter = "";
      ref.style.pointerEvents = "";

      const sibling = getContainerSibling(ref, reactive.resizeOrigin);
      if (sibling) {
        sibling.style.pointerEvents = "";
      }

      // setResizeOrigin(null);
      reactive.resizeOrigin = null;
    }
  };

  const resizeFrame = (e) => {
    if (e.buttons !== 1) {
      clearResize();
      return;
    }

    if (!reactive.resizeOrigin) {
      return;
    }

    const ref = {
      aside: asideRef,
      editor: editorRef,
      terminal: terminalRef,
    }[reactive.resizeOrigin.ref].current;

    const checkOutOfRange = (value) => {
      if (
        value < reactive.resizeOrigin.min ||
        value > reactive.resizeOrigin.max
      ) {
        ref.style.filter = "opacity(0.5)";
        reactive.resizeOrigin = {
          ...reactive.resizeOrigin,
          outOfRange: value < reactive.resizeOrigin.min ? "min" : "max",
        };
      } else {
        ref.style.filter = "";
        reactive.resizeOrigin = {
          ...reactive.resizeOrigin,
          outOfRange: null,
        };
      }
    };

    const sibling = getContainerSibling(ref, reactive.resizeOrigin);
    if (sibling) {
      ref.style.pointerEvents = "none";
      sibling.style.pointerEvents = "none";
    }

    if (reactive.resizeOrigin.type === "right") {
      const offsetX = e.clientX - reactive.resizeOrigin.mouseX;
      const width = reactive.resizeOrigin.targetWidth + offsetX;

      checkOutOfRange(width);

      const fixedWidth = `${Math.min(
        reactive.resizeOrigin.max,
        Math.max(reactive.resizeOrigin.min, width)
      )}px`;
      ref.style.width = fixedWidth;
      ref.style.minWidth = fixedWidth;
      ref.style.maxWidth = fixedWidth;
    } else if (reactive.resizeOrigin.type === "top") {
      const offsetY = -(e.clientY - reactive.resizeOrigin.mouseY);
      const height = reactive.resizeOrigin.targetHeight + offsetY;

      checkOutOfRange(height);

      ref.style.height = `${Math.min(
        reactive.resizeOrigin.max,
        Math.max(reactive.resizeOrigin.min, height)
      )}px`;
    }
  };

  const resizeDone = () => {
    if (!reactive.resizeOrigin) {
      return;
    }

    const ref = {
      aside: asideRef,
      editor: editorRef,
      terminal: terminalRef,
    }[reactive.resizeOrigin.ref].current;

    if (reactive.resizeOrigin.outOfRange) {
      if (
        resizeOutOfRange(
          reactive.resizeOrigin.ref,
          reactive.resizeOrigin.outOfRange
        )
      ) {
        if (reactive.resizeOrigin.type === "right") {
          ref.style.width = `${reactive.resizeOrigin.targetWidth}px`;
        }

        if (reactive.resizeOrigin.type === "top") {
          ref.style.height = `${reactive.resizeOrigin.targetHeight}px`;
        }
      }
    }

    clearResize();
  };

  const resetSize = (type, refName) => {
    const ref = {
      aside: asideRef,
      editor: editorRef,
      terminal: terminalRef,
    }[refName].current;

    if (type === "right") {
      ref.style.width = "";
      ref.style.minWidth = "";
      ref.style.maxWidth = "";
    } else if (type === "top") {
      ref.style.height = "";
    }

    // emitResize();
  };

  const initResize = (type, refName, min, max, e) => {
    const ref = {
      aside: asideRef,
      editor: editorRef,
      terminal: terminalRef,
    }[refName].current;

    console.log(type, reactive.resizeOrigin, refName, min, max)

    if (!reactive.resizeOrigin && type) {
      reactive.resizeOrigin = {
        min,
        max,
        type,
        ref: refName,
        mouseX: e.clientX,
        mouseY: e.clientY,
        targetWidth: ref.clientWidth,
        targetHeight: ref.clientHeight,
        targetLeft: ref.clientLeft,
        targetTop: ref.clientTop,
        outOfRange: null,
      };
    }
  };

  const initEditorResize = (e) => {
    if (contentRef.current) {
      const maxWidth = contentRef.current.clientWidth - 270;
      initResize("right", "editor", 200, maxWidth, e);
    }
  };

  useEffect(() => {
    // Equivalent to Vue's onMounted
    window.document.addEventListener("mousemove", resizeFrame);
    window.document.addEventListener("mouseup", resizeDone);

    // Equivalent to Vue's watchPostEffect
    if (!showEditor || !showView) {
      if (editorRef.current) {
        editorRef.current.style.width = "";
        editorRef.current.style.minWidth = "";
        editorRef.current.style.maxWidth = "";
      }
    }

    return () => {
      // Equivalent to Vue's onBeforeUnmount
      window.document.removeEventListener("mousemove", resizeFrame);
      window.document.removeEventListener("mouseup", resizeDone);
    };
  }, [showEditor, showView]);

  // rightBefore
  const [rightBeforeWidth, setRightBeforeWidth] = useState("100%");

  useLayoutEffect(() => {
    if (showEditor && showView && editorRef.current) {
      setRightBeforeWidth(`${editorRef.current.offsetWidth}px`);
    } else {
      setRightBeforeWidth("100%");
    }
  }, [showEditor, showView, editorRef.current?.offsetWidth]);

  useEffect(() => {
    setSideWidth(asideRef.current?.offsetWidth ?? 0);
  }, [asideRef.current?.offsetWidth, showSide]);

  const { initFile } = useFileStore((state) => ({
    initFile: state.initFile,
  }));

  useEffect(() => {
    return () => {
      initFile();
      revokeCompiledPdfUrl();
      setCompilerLog("");
    };
  }, []);

  // Convert Vue's template syntax to JSX
  return (
    <div className={`layout ${presentation ? "presentation" : ""}`}>
      {/* {showHeader && <div className="header">{header}</div>} */}
      <div className="header flex h-[2.2rem]">
        {header}
      </div>
      <div className="main">

        {showSide && (
          <div className="left" ref={asideRef} id="left">
            {left}
            <div
              className="sash-right"
              id="sash-right"
              onDoubleClick={() => resetSize("right", "aside")}
              onMouseDown={(e) => initResize("right", "aside", 130, 700, e)}
            >
              <div className="icon-container">
                <div className="icon-arrow" onClick={() => toggleSide()}>
                  <img
                    src={leftLine}
                    alt="right arrow"
                    className="arrow-img"
                    draggable="false"
                  />


                </div>
                <div className="icon-dots">
                  <img
                    src={dotsLine}
                    alt="dots"
                    className="dots-img"
                    draggable="false"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="ar-right">
          <div className="content" ref={contentRef}>
            {showEditor && (
              <div className="editor" ref={editorRef}>
                {content}
              </div>
            )}
            {showView && showEditor && (
              <div
                className="sash-left"
                id="sash-left"
                onDoubleClick={() => resetSize("right", "editor")}
                onMouseDown={(e) => {
                  e.preventDefault()
                  initEditorResize(e);
                  setWillResizing(true);
                }}
                onMouseUp={() => setWillResizing(false)}
              >
                <div className="icon-container">
                  <div className="icon-arrow" onClick={() => toggleView()}>
                    <img
                      src={rightLine}
                      alt="right arrow"
                      className="arrow-img"
                      draggable="false"
                    />
                  </div>
                  <div className="icon-dots">
                    <img
                      src={dotsLine}
                      alt="dots"
                      className="dots-img"
                      draggable="false"
                    />

                  </div>
                </div>
              </div>
            )}
            {showView && <div className="preview">{preview}</div>}
          </div>
          {showXterm && (
            <div className="terminal" ref={terminalRef}>
              {terminal}
              <div
                className="sash-top"
                onDoubleClick={() => resetSize("top", "terminal")}
                onMouseDown={(e) => initResize("top", "terminal", 70, 500, e)}
              ></div>
            </div>
          )}
        </div>
      </div>
      {/* {showFooter && <div className="footer">{footer}</div>} */}
    </div>
  );
};

export default Layout;
