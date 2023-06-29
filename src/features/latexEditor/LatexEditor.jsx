/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
import { useEffect, useRef, useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-latex";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";

//yjs
import { routerQuery, getRandomColor } from "../../util";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebsocketProvider } from "y-websocket";

import latexSyncToYText from "./latexSyncToYText";
import useYText from "../..//useHooks/useYText";

//constants
const LATEX_NAME = "latex-demo";
const ROOM_NAME = "latex-co-room";

const doc = new Y.Doc();
// @ts-ignore
window.doc = doc;

export const LatexEditor = ({ handleChange, sourceCode }) => {
  const latexRef = useRef(null);
  const { yText, undoManager } = useYText({ name: LATEX_NAME, doc });
  const [fragments, setFragments] = useState([]);

  useEffect(() => {
    const db = new IndexeddbPersistence("latexDemo", doc);
    db.on("synced", (idbPersistence) => {
      if (latexRef.current.editor) {
        latexRef.current.editor.setValue(yText.toString());
      }
    });

    const wsProvider = new WebsocketProvider(
      "ws://10.10.99.98:9000",
      ROOM_NAME,
      doc,
      { connect: true }
    );
    wsProvider.on("status", (event) => {
      if (event.status === "connected") {
        console.log("wsProvider成功连接✅");
      } else {
        console.log("wsProvider断开连接❌");
      }
    });

    const { awareness } = wsProvider;
    awareness.setLocalState({
      user: {
        name:
          routerQuery().username ?? `游客${Date.now().toString().slice(-5)}`,
        color: getRandomColor(),
        id: doc.clientID,
      },
      selectionRange: [0, 0],
    });
    awareness.on("change", (changes) => {
      let currentStates = Array.from(awareness.getStates().values());
      const text = yText.toString();
      let _fragments = [];
      let lastPosition = 0;
      if (currentStates.length > 1) {
        currentStates = currentStates.sort(
          (state1, state2) =>
            state1.selectionRange[0] - state2.selectionRange[0]
        );
      }
      currentStates.forEach((state) => {
        const { selectionRange, user } = state;
        if (selectionRange && user.id !== doc.clientID) {
          const [cursorPosition, end] = selectionRange;
          if (cursorPosition === lastPosition) {
            return;
          }
          const content = text.slice(lastPosition, cursorPosition);
          lastPosition = cursorPosition;
          _fragments.push(
            <div className="fake-content hidden" key={user.id}>
              {content}
            </div>
          );
          _fragments.push(
            <span
              className="cursor"
              key={`${user.id}-cursor`}
              // @ts-ignore
              style={{ "--cursor-color": user.color }}
            >
              <div className="cursor-label">{user.name}</div>
            </span>
          );
        }
      });
      setFragments(_fragments);
    });
    let unlisten = () => {};
    if (latexRef.current.editor) {
      latexSyncToYText({
        yText,
        latex: latexRef.current.editor,
        undoManager,
        awareness,
      });
    }
    return () => {
      wsProvider.destroy();
      unlisten();
    };
  }, []);

  return (
    <div>
      <AceEditor
        mode="latex"
        theme="monokai" //monokai
        name="aceEditor"
        height="100%"
        width="100%"
        wrapEnabled={true}
        fontSize="16px"
        editorProps={{ $blockScrolling: true }}
        onChange={handleChange}
        value={sourceCode}
        className="border border-black"
        ref={latexRef}
      ></AceEditor>
      <div className="input overlay">{fragments}</div>
    </div>
  );
};
