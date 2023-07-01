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
import { useSelector, useDispatch } from "react-redux";
import {
  setPreamble,
  setBody,
  selectBody,
  selectFullSourceCode,
  selectShowFullSourceCode,
} from "./latexEditorSlice";

//yjs
import { routerQuery, getRandomColor } from "../../util";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebsocketProvider } from "y-websocket";

import latexSyncToYText from "./latexSyncToYText";
import useYText from "../..//useHooks/useYText";

//constants
const LATEX_NAME = "<lat2ex->11111111111->";
const ROOM_NAME = "latex-12111211123121s1ss";

const doc = new Y.Doc();
// @ts-ignore
window.doc = doc;

export const LatexEditor = ({ handleChange, sourceCode }) => {
  const latexRef = useRef(null);
  const { yText, undoManager } = useYText({ name: LATEX_NAME, doc });
  const [fragments, setFragments] = useState([]);

  const body = useSelector(selectBody);
  const fullSourceCode = useSelector(selectFullSourceCode);
  const showFullSource = useSelector(selectShowFullSourceCode);

  useEffect(() => {
    const db = new IndexeddbPersistence("latexDemo", doc);
    // db.on("synced", (idbPersistence) => {
    //   if (latexRef.current) {
    //     handleChange(yText.toString() ?? sourceCode);
    //   }
    // });

    const wsProvider = new WebsocketProvider(
      "ws://10.10.99.98:9000",
      ROOM_NAME,
      doc,
      { connect: true }
    );
    wsProvider.on("status", (event) => {
      if (event.status === "connected") {
      } else {
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
      const [yDoc, _yText, unlistens] = latexSyncToYText({
        yText,
        latex: latexRef.current.editor,
        undoManager,
        awareness,
        handleChange,
      });
      unlisten = unlistens;
      //   yDoc.transact(() => {
      //     // if (range[0] !== range[1]) {
      //     //   const deleteLength = range[1] - range[0];
      //     //   yText.delete(range[0], deleteLength);
      //     // }
      //     // _yText.insert(range[0], lines[0] || "");
      //     //假设yText已经被初始化为了一个Y.Text实例

      //     let length = _yText.toString()?.length;
      //     console.log(_yText.toString()?.length, "123");

      //     new Promise((resolve, reject) => {
      //       _yText.delete(0, length);
      //       resolve();
      //     }).then(() => {
      //       console.log(_yText.toString(), "de");
      //       //在位置插入新内容
      //       _yText.insert(0, sourceCode);
      //     });
      //   }, yDoc.clientID);
    }
    return () => {
      wsProvider.destroy();
      unlisten();
    };
  }, []);

  // useEffect(() => {
  //   console.log("sourceCode", sourceCode);

  // }, [body]);

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
