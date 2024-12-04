import * as Y from "yjs";

function latexSyncToYText(yText, editor, undoManager, changeValue) {
  if (!yText || !editor || !undoManager || !changeValue) {
    console.error("Invalid arguments passed to latexSyncToYText");
    return;
  }
  let range = [0, 0];
  let relPos1 = Y.createRelativePositionFromTypeIndex(yText, range[0]);
  let relPos2 = Y.createRelativePositionFromTypeIndex(yText, range[1]);

  const yDoc = yText.doc;
  let isLocalChange = false;

  function getVal() {
    return editor?.getValue() || "";
  }
  function getRange() {
    return [editor.selectionStart, editor.selectionEnd];
  }

  function setRange() {
    range = getRange();
    return range;
  }

  function yTextObserveHandler(event) {
    if (isLocalChange) return;

    console.log("Event changes:", event.changes);
    isLocalChange = true;

    let currentIndex = 0; // Track the current index position in the document

    event.changes.delta.forEach((change) => {
      const currentVal = editor.getValue();
      console.log("Current Value:", currentVal);

      if (change.insert) {
        // Calculate the insert position based on the current index
        const insertPos = currentIndex;
        const insertText = change.insert;
        console.log("Inserting text at position:", insertPos, insertText);

        const newVal =
          currentVal.slice(0, insertPos) +
          insertText +
          currentVal.slice(insertPos);
        console.log(newVal, "newVal");

        changeValue(newVal, true);
        currentIndex += insertText.length; // Update index position
      } else if (change.delete) {
        const deletePos = currentIndex;
        const deleteLength = change.delete;
        const newVal =
          currentVal.slice(0, deletePos) +
          currentVal.slice(deletePos + deleteLength);
        changeValue(newVal, true);
        // No need to update currentIndex as we're deleting
      }

      // Update currentIndex based on the length of the change
      if (change.retain) {
        currentIndex += change.retain;
      }
    });

    isLocalChange = false;
  }

  function handleInput(e) {
    console.log(e, "e");
    const { action, lines, start } = e;
    const position = start.row * start.column; // 计算插入位置

    console.log(action, "inputType");

    if (action == "insert") {
      yDoc.transact(() => {
        // if (range[0] !== range[1]) {
        //   const deleteLength = range[1] - range[0];
        //   yText.delete(range[0], deleteLength);
        // }
        // yText.insert(range[0], lines[0] || "");
        // 假设yText已经被初始化为了一个Y.Text实例

        let length = yText.toString().length;
        new Promise((resolve, reject) => {
          yText.delete(0, length);
          resolve();
        }).then(() => {
          console.log(yText.toString(), "de", getVal());
          //在位置插入新内容
          yText.insert(0, getVal());
        });

        //在位置插入新内容
      }, yDoc.clientID);
    } else if (action == "remove") {
      yDoc.transact(() => {
        let length = yText.toString().length;
        yText.delete(0, length);
        yText.insert(0, getVal());
      }, yDoc.clientID);
    } else if (action === "historyUndo") {
      undoManager.undo();
    } else if (action === "historyRedo") {
      undoManager.redo();
    }
    // setVal(yText.toString());
    // latex.setValue(yText.toString());
    // latex.setSelectionRange(newRange[0], newRange[1]);
  }

  if (editor.session) {
    editor.session.on("change", handleInput);
  } else {
    console.error("Editor session is not valid");
  }

  function beforeTransactionListener() {
    const beforeRange = getRange();
    relPos1 = Y.createRelativePositionFromTypeIndex(yText, beforeRange[0]);
    relPos2 = Y.createRelativePositionFromTypeIndex(yText, beforeRange[1]);
  }

  yText.observe(yTextObserveHandler);
  yDoc.on("beforeAllTransactions", beforeTransactionListener);

  return () => {
    if (editor) {
      if (editor.session) {
        editor.session.off("change", handleInput);
      }
    }
    yDoc.off("beforeAllTransactions", beforeTransactionListener);

    yText.unobserve(yTextObserveHandler);
  };
}

export { latexSyncToYText };
