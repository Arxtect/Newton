/*
 * @Description:
 * @Author: Devin
 * @Date: 2023-06-26 09:57:49
 */
import React, { useLayoutEffect, useRef, useState } from "react";
import AceEditor from "react-ace";
import "ace-builds/src-noconflict/mode-latex";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/theme-monokai";
import "ace-builds/src-noconflict/ext-language_tools";
//yjs
import { routerQuery, getRandomColor } from "../../util";
import { setBody } from "./latexEditorSlice";
import * as Y from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { WebsocketProvider } from "y-websocket";

import latexSyncToYText from "./latexSyncToYText";
import useYText from "../..//useHooks/useYText";
import { AceBinding } from "./y-ace";
import demo from "./demo";
import { useSelector, useDispatch } from "react-redux";
//constants
const LATEX_NAME = "latex-demo1";
const ROOM_NAME = "latex-demo1";

const doc = new Y.Doc();
// @ts-ignore
window.doc = doc;

// const host = window.location.hostname;
const host = "206.190.239.91:9008";
const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `${wsProtocol}//${host}/websockets`;
// const wsUrl = "wss://arxtect.com/websockets"

const LatexEditor = ({ handleChange, sourceCode }) => {
  const latexRef = useRef(null);
  const { yText, undoManager } = useYText({ name: LATEX_NAME, doc });
  const [fragments, setFragments] = useState([]);
  const dispatch = useDispatch();

  useLayoutEffect(() => {
    const db = new IndexeddbPersistence("latexDemo", doc);
    // db.on("synced", (idbPersistence) => {
    //   if (latexRef.current) {
    //     handleChange(yText.toString() ?? sourceCode);
    //   }
    // });

    const wsProvider = new WebsocketProvider(wsUrl, ROOM_NAME, doc, {
      connect: true,
    });
    wsProvider.on("status", (event) => {
      if (event.status === "connected") {
      } else {
      }
    });

    window.wsProvider = wsProvider;
    console.log(window.wsProvider, "321");

    const type = doc.getText(ROOM_NAME);

    const binding = new AceBinding(
      type,
      latexRef.current.editor,
      wsProvider.awareness
    );

    window.binding = binding;

    let user = {
      name: "user:" + Math.random().toString(36).substring(7),
      color: "#" + Math.floor(Math.random() * 16777215).toString(16),
    };

    // Define user name and user name
    wsProvider.awareness.setLocalStateField("user", user);

    wsProvider.awareness.on("change", function () {
      let userCount = wsProvider.awareness.getStates().size;
      let userIcon = "👤 ";
      if (userCount > 1) {
        userIcon = "👥 ";
      } else {
        // dispatch(setBody(demo));
      }
      document.getElementById("users").innerHTML =
        userIcon + userCount + " users";
    });

    // if (latexRef.current.editor) {
    //   unlisten = latexSyncToYText({
    //     yText,
    //     latex: latexRef.current.editor,
    //     undoManager,
    //     awareness,
    //     handleChange,
    //   });
    // }
    return () => {
      wsProvider.destroy();
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
      {/* <div className="input overlay">{fragments}</div> */}
      <div id="users"></div>
    </div>
  );
};

export default React.memo(LatexEditor);
