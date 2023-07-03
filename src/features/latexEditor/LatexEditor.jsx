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
import { setBody, selectBody } from "./latexEditorSlice";
import ReactQuill, { Quill } from "react-quill";
import QuillCursors from "quill-cursors";
import "react-quill/dist/quill.core.css";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";

//yjs
import { routerQuery, getRandomColor } from "../../util";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebsocketProvider } from "y-websocket";

import latexSyncToYText from "./latexSyncToYText";
import useYText from "../..//useHooks/useYText";

import QuillEditor from "./quill";
import Ydoc from "./ydoc";

//constants
const LATEX_NAME = "latex-quill";
const ROOM_NAME = "room-quill";

const doc = new Y.Doc();
// @ts-ignore
window.doc = doc;

Quill.register("modules/cursors", QuillCursors);

export const LatexEditor = ({ sourceCode }) => {
  const latexRef = useRef(null);
  const dispatch = useDispatch();
  // const { yText, undoManager } = useYText({ name: LATEX_NAME, doc });
  const [fragments, setFragments] = useState([]);

  // const body = useSelector(selectBody);
  // const fullSourceCode = useSelector(selectFullSourceCode);
  // const showFullSource = useSelector(selectShowFullSourceCode);

  // useEffect(() => {
  //   const db = new IndexeddbPersistence("latexDemo", doc);
  //   // db.on("synced", (idbPersistence) => {
  //   //   if (latexRef.current) {
  //   //     handleChange(yText.toString() ?? sourceCode);
  //   //   }
  //   // });

  //   const wsProvider = new WebsocketProvider(
  //     "ws://10.10.99.98:9000",
  //     ROOM_NAME,
  //     doc,
  //     { connect: true }
  //   );
  //   wsProvider.on("status", (event) => {
  //     if (event.status === "connected") {
  //     } else {
  //     }
  //   });

  //   const { awareness } = wsProvider;
  //   awareness.setLocalState({
  //     user: {
  //       name:
  //         routerQuery().username ?? `游客${Date.now().toString().slice(-5)}`,
  //       color: getRandomColor(),
  //       id: doc.clientID,
  //     },
  //     selectionRange: [0, 0],
  //   });
  //   awareness.on("change", (changes) => {
  //     let currentStates = Array.from(awareness.getStates().values());
  //     const text = yText.toString();
  //     let _fragments = [];
  //     let lastPosition = 0;
  //     if (currentStates.length > 1) {
  //       currentStates = currentStates.sort(
  //         (state1, state2) =>
  //           state1.selectionRange[0] - state2.selectionRange[0]
  //       );
  //     }
  //     currentStates.forEach((state) => {
  //       const { selectionRange, user } = state;
  //       if (selectionRange && user.id !== doc.clientID) {
  //         const [cursorPosition, end] = selectionRange;
  //         if (cursorPosition === lastPosition) {
  //           return;
  //         }
  //         const content = text.slice(lastPosition, cursorPosition);
  //         lastPosition = cursorPosition;
  //         _fragments.push(
  //           <div className="fake-content hidden" key={user.id}>
  //             {content}
  //           </div>
  //         );
  //         _fragments.push(
  //           <span
  //             className="cursor"
  //             key={`${user.id}-cursor`}
  //             // @ts-ignore
  //             style={{ "--cursor-color": user.color }}
  //           >
  //             <div className="cursor-label">{user.name}</div>
  //           </span>
  //         );
  //       }
  //     });
  //     setFragments(_fragments);
  //   });
  //   let unlisten = () => {};
  //   if (latexRef.current.editor) {
  //     const [yDoc, _yText, unlistens] = latexSyncToYText({
  //       yText,
  //       latex: latexRef.current.editor,
  //       undoManager,
  //       awareness,
  //       handleChange,
  //     });
  //     unlisten = unlistens;
  //     //   yDoc.transact(() => {
  //     //     // if (range[0] !== range[1]) {
  //     //     //   const deleteLength = range[1] - range[0];
  //     //     //   yText.delete(range[0], deleteLength);
  //     //     // }
  //     //     // _yText.insert(range[0], lines[0] || "");
  //     //     //假设yText已经被初始化为了一个Y.Text实例

  //     //     let length = _yText.toString()?.length;
  //     //     console.log(_yText.toString()?.length, "123");

  //     //     new Promise((resolve, reject) => {
  //     //       _yText.delete(0, length);
  //     //       resolve();
  //     //     }).then(() => {
  //     //       console.log(_yText.toString(), "de");
  //     //       //在位置插入新内容
  //     //       _yText.insert(0, sourceCode);
  //     //     });
  //     //   }, yDoc.clientID);
  //   }
  //   return () => {
  //     wsProvider.destroy();
  //     unlisten();
  //   };
  // }, []);

  const handleChange = (value) => {
    if (!latexRef.current) return;
    const text = latexRef.current.editor.getText();
    console.log(text, "text");
    dispatch(setBody(text));
  };

  useEffect(() => {
    if (!latexRef.current || window.ydoc) return;
    // const container = document.getElementById("editor");
    // const quillEditor = new QuillEditor(container);
    const ydoc = new Ydoc();
    // ydoc.bindEditor(quillEditor.load());
    ydoc.bindEditor(latexRef.current.editor);
    window.ydoc = ydoc;
  }, []);

  return (
    <div>
      {/* <AceEditor
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
      ></AceEditor> */}
      {/* <div id={"editor"} style={{ maxHeight: "92.45%" }}> */}
      {/* {fragments} */}
      {/* </div> */}
      <ReactQuill
        placeholder="just type anything..."
        modules={{
          cursors: true,
          history: {
            userOnly: true,
          },
        }}
        theme="snow"
        ref={latexRef}
        style={{ height: " 78.8vh" }}
        // value={sourceCode}
        onChange={handleChange}
        formats={["latex"]}
        // readOnly={true}
        // formats={[
        //   "math-latex",
        //   "math-latex",
        //   "bold",
        //   "italic",
        //   "underline",
        //   "strike",
        // ]}
      ></ReactQuill>
    </div>
  );
};
