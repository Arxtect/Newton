import { memo, useCallback, useEffect, useRef, useState } from "react";
import { debounce, throttle } from "@/util";
// import PdfViewerControlsToolbar from "./pdf-viewer-controls-toolbar";
// import { useProjectContext } from "../../../shared/context/project-context";
// import { buildHighlightElement } from "../util/highlights";
import PDFJSWrapper from "./pdf-js-wrapper";

// import { useDetachCompileContext as useCompileContext } from "../../../shared/context/detach-compile-context";

// import * as eventTracking from "../../../infrastructure/event-tracking";
import {
  usePdfPreviewContext,
  PdfPreviewProvider,
} from "./hooks/pdf-preview-provider";
import usePresentationMode from "./hooks/use-presentation-mode";
import useMouseWheelZoom from "./hooks/use-mouse-wheel-zoom";
import usePersistedState from "./hooks/use-persisted-state";

function PdfJsViewer({ url, pdfFile, currentProject = "arxtect" }) {
  //   const { _id: projectId } = useProjectContext();
  //   const { setError, firstRenderDone, highlights, position, setPosition } =
  //     useCompileContext();
  const { setLoadingError } = usePdfPreviewContext();

  const [scale, setScale] = usePersistedState(
    `pdf-viewer-scale:${currentProject}`,
    "page-width"
  );
  const [rawScale, setRawScale] = useState(null);
  const [page, setPage] = useState(null);
  const [totalPages, setTotalPages] = useState(null);
  const [pdfJsWrapper, setPdfJsWrapper] = useState(null);
  const [initialised, setInitialised] = useState(false);

  const handlePageChange = useCallback(
    (newPage) => {
      if (!totalPages || newPage < 1 || newPage > totalPages) {
        return;
      }
      setPage(newPage);
      if (pdfJsWrapper?.viewer) {
        pdfJsWrapper.viewer.currentPageNumber = newPage;
      }
    },
    [pdfJsWrapper, setPage, totalPages]
  );

  const handleContainer = useCallback(
    (parent) => {
      if (parent) {
        const wrapper = new PDFJSWrapper(parent.firstChild);
        console.log(wrapper, "wrapper");
        wrapper
          .init()
          .then(() => {
            setPdfJsWrapper(wrapper);
          })
          .catch((error) => {
            console.error(error, "error");
            setLoadingError(true);
          });

        return () => {
          setPdfJsWrapper(null);
          wrapper.destroy();
        };
      }
    },
    [setLoadingError]
  );

  const [startFetch, setStartFetch] = useState(0);

  useEffect(() => {
    // if (!pdfJsWrapper || !firstRenderDone) return;
    console.log(pdfJsWrapper, "pdfJsWrapper");
    if (!pdfJsWrapper) return;
    let timePDFFetched;
    let timePDFRendered;
    const submitLatencies = () => {
      if (!timePDFFetched) return;

      const latencyFetch = Math.ceil(timePDFFetched - startFetch);
      let latencyRender;
      if (timePDFRendered) {
        latencyRender = Math.ceil(timePDFRendered - timePDFFetched);
      }
      //   firstRenderDone({
      //     latencyFetch,
      //     latencyRender,
      //   });
    };

    const handlePagesinit = () => {
      setInitialised(true);
      timePDFFetched = performance.now();
      if (document.hidden) {
        submitLatencies();
      }
    };

    const handleRendered = () => {
      if (!document.hidden) {
        timePDFRendered = performance.now();
      }
      submitLatencies();
      pdfJsWrapper.eventBus.off("pagerendered", handleRendered);
    };

    const handleRenderedInitialPageNumber = () => {
      setPage(pdfJsWrapper.viewer.currentPageNumber);
      pdfJsWrapper.eventBus.off(
        "pagerendered",
        handleRenderedInitialPageNumber
      );
    };

    const handleScaleChanged = (scale) => {
      console.log(scale, "scale");
      setRawScale(scale.scale);
    };

    pdfJsWrapper.eventBus.on("pagesinit", handlePagesinit);
    pdfJsWrapper.eventBus.on("pagerendered", handleRendered);
    pdfJsWrapper.eventBus.on("pagerendered", handleRenderedInitialPageNumber);
    pdfJsWrapper.eventBus.on("scalechanging", handleScaleChanged);

    return () => {
      pdfJsWrapper.eventBus.off("pagesinit", handlePagesinit);
      pdfJsWrapper.eventBus.off("pagerendered", handleRendered);
      pdfJsWrapper.eventBus.off(
        "pagerendered",
        handleRenderedInitialPageNumber
      );
      pdfJsWrapper.eventBus.off("scalechanging", handleScaleChanged);
    };
  }, [pdfJsWrapper, startFetch]); //firstRenderDone

  useEffect(() => {
    console.log(url, pdfFile, pdfJsWrapper, "url, pdfFile");
    if (pdfJsWrapper && url) {
      setInitialised(false);
      setStartFetch(performance.now());

      const abortController = new AbortController();
      pdfJsWrapper
        .loadDocument({ url, pdfFile, abortController })
        .then((doc) => {
          setTotalPages(doc.numPages);
        })
        .catch((error) => {
          console.error(error);
        });
      return () => {
        abortController.abort();
        pdfJsWrapper.abortDocumentLoading();
      };
    }
  }, [pdfJsWrapper, url, pdfFile, setStartFetch]);

  useEffect(() => {
    let storePositionTimer;

    if (initialised && pdfJsWrapper) {
      if (!pdfJsWrapper.isVisible()) {
        return;
      }

      const storePosition = debounce((pdfViewer) => {
        try {
          //   setPosition(pdfViewer.currentPosition);
        } catch (error) {
          console.error(error);
        }
      }, 500);

      storePositionTimer = window.setTimeout(() => {
        storePosition(pdfJsWrapper);
      }, 100);

      const scrollListener = () => {
        storePosition(pdfJsWrapper);
        setPage(pdfJsWrapper.viewer.currentPageNumber);
      };

      pdfJsWrapper.container.addEventListener("scroll", scrollListener);

      return () => {
        pdfJsWrapper.container.removeEventListener("scroll", scrollListener);
        if (storePositionTimer) {
          window.clearTimeout(storePositionTimer);
        }
        // storePosition.cancel();
      };
    }
  }, [pdfJsWrapper, initialised]); //setPosition

  useEffect(() => {
    if (pdfJsWrapper) {
      const handleTextlayerrendered = (textLayer) => {
        const textLayerDiv =
          textLayer.source.textLayerDiv ?? textLayer.source.textLayer.div;

        if (!textLayerDiv.dataset.listeningForDoubleClick) {
          textLayerDiv.dataset.listeningForDoubleClick = true;

          const doubleClickListener = (event) => {
            const clickPosition = pdfJsWrapper.clickPosition(
              event,
              textLayerDiv.closest(".page").querySelector("canvas"),
              textLayer.pageNumber - 1
            );

            console.log(clickPosition, "clickPosition");

            if (clickPosition) {
              //   eventTracking.sendMB("jump-to-location", {
              //     direction: "pdf-location-in-code",
              //     method: "double-click",
              //   });
              //   window.dispatchEvent(
              //     new CustomEvent("synctex:sync-to-position", {
              //       detail: clickPosition,
              //     })
              //   );
            }
          };

          textLayerDiv.addEventListener("dblclick", doubleClickListener);
        }
      };

      pdfJsWrapper.eventBus.on("textlayerrendered", handleTextlayerrendered);
      return () =>
        pdfJsWrapper.eventBus.off("textlayerrendered", handleTextlayerrendered);
    }
  }, [pdfJsWrapper]);

  //   const positionRef = useRef(position);
  //   useEffect(() => {
  //     positionRef.current = position;
  //   }, [position]);

  const scaleRef = useRef(scale);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    if (initialised && pdfJsWrapper) {
      if (!pdfJsWrapper.isVisible()) {
        return;
      }
      //   if (positionRef.current) {
      //     pdfJsWrapper.scrollToPosition(positionRef.current, scaleRef.current);
      //   } else {
      //     pdfJsWrapper.viewer.currentScaleValue = scaleRef.current;
      //     }
      pdfJsWrapper.viewer.currentScaleValue = scaleRef.current;
    }
  }, [initialised, pdfJsWrapper, scaleRef]); //positionRef

  useEffect(() => {
    if (pdfJsWrapper) {
      pdfJsWrapper.viewer.currentScaleValue = scale;
    }
  }, [scale, pdfJsWrapper]);

  useEffect(() => {
    const timers = [];
    let intersectionObserver;

    if (pdfJsWrapper) {
      //&& highlights?.length
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              intersectionObserver.unobserve(entry.target);

              const element = entry.target;

              element.style.opacity = "0.5";

              timers.push(
                window.setTimeout(() => {
                  element.style.opacity = "0";
                }, 1100)
              );
            }
          }
        },
        {
          threshold: 1.0,
        }
      );

      const elements = [];

      //   for (const highlight of highlights) {
      //     try {
      //       const element = buildHighlightElement(highlight, pdfJsWrapper);
      //       elements.push(element);
      //       intersectionObserver.observe(element);
      //     } catch (error) {
      //       // ignore invalid highlights
      //     }
      //   }

      const [firstElement] = elements;

      if (firstElement) {
        timers.push(
          window.setTimeout(() => {
            firstElement.scrollIntoView({
              block: "center",
              inline: "start",
              behavior: "smooth",
            });
          }, 100)
        );
      }

      return () => {
        for (const timer of timers) {
          window.clearTimeout(timer);
        }
        for (const element of elements) {
          element.remove();
        }
        intersectionObserver?.disconnect();
      };
    }
  }, [pdfJsWrapper]); //highlights

  const setZoom = useCallback(
    (zoom) => {
      switch (zoom) {
        case "zoom-in":
          if (pdfJsWrapper) {
            setScale(
              `${Math.min(pdfJsWrapper.viewer.currentScale * 1.25, 9.99)}`
            );
          }
          break;

        case "zoom-out":
          if (pdfJsWrapper) {
            setScale(
              `${Math.max(pdfJsWrapper.viewer.currentScale / 1.25, 0.1)}`
            );
          }
          break;

        default:
          setScale(zoom);
      }
    },
    [pdfJsWrapper, setScale]
  );

  useEffect(() => {
    if (pdfJsWrapper && "ResizeObserver" in window) {
      const resizeListener = throttle(() => {
        pdfJsWrapper.updateOnResize();
      }, 250);

      const resizeObserver = new ResizeObserver(resizeListener);
      resizeObserver.observe(pdfJsWrapper.container);

      window.addEventListener("resize", resizeListener);

      return () => {
        resizeObserver.disconnect();
        window.removeEventListener("resize", resizeListener);
      };
    }
  }, [pdfJsWrapper]);

  const handleKeyDown = useCallback(
    (event) => {
      if (!initialised || !pdfJsWrapper) {
        return;
      }
      if (event.metaKey || event.ctrlKey) {
        switch (event.key) {
          case "+":
          case "=":
            event.preventDefault();
            setZoom("zoom-in");
            pdfJsWrapper.container.focus();
            break;

          case "-":
            event.preventDefault();
            setZoom("zoom-out");
            pdfJsWrapper.container.focus();
            break;

          case "0":
            event.preventDefault();
            setZoom("page-width");
            pdfJsWrapper.container.focus();
            break;

          case "9":
            event.preventDefault();
            setZoom("page-height");
            pdfJsWrapper.container.focus();
            break;

          default:
            break;
        }
      }
    },
    [initialised, setZoom, pdfJsWrapper]
  );

  useMouseWheelZoom(pdfJsWrapper, setScale);

  const requestPresentationMode = usePresentationMode(
    pdfJsWrapper,
    page,
    handlePageChange,
    scale,
    setScale
  );

  const toolbarInfoLoaded =
    rawScale !== null && page !== null && totalPages !== null;

  return (
    <div
      className="absolute w-full h-full focus:outline-none bg-transparent bottom-0 left-0  right-0 top-0 overflow-hidden"
      ref={handleContainer}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="absolute w-full h-full overflow-y-scroll flex justify-center"
        tabIndex={0}
        role="tabpanel"
      >
        <div className="min-h-full" />
      </div>
      {/* {toolbarInfoLoaded && (
        <PdfViewerControlsToolbar
          requestPresentationMode={requestPresentationMode}
          setZoom={setZoom}
          rawScale={rawScale}
          setPage={handlePageChange}
          page={page}
          totalPages={totalPages}
        />
      )} */}
    </div>
  );
}

export { PdfPreviewProvider, PdfJsViewer };
