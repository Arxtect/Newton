import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

function latexSyncToYText({
  yText,
  latex,
  undoManager,
  awareness,
  handleChange,
}) {
  let range = [0, 0];
  let relPos1 = Y.createRelativePositionFromTypeIndex(yText, range[0]);
  let relPos2 = Y.createRelativePositionFromTypeIndex(yText, range[1]);

  function getVal() {
    return latex?.getValue() || "";
  }

  function setVal(value) {
    latex.setValue(value);
    console.log(latex.value, "latex.value");
    // latex?.setValue(value || "", -1);
  }

  function getRange() {
    return [latex.selectionStart, latex.selectionEnd];
  }

  function setRange() {
    range = getRange();
    return range;
  }

  const yDoc = yText.doc;

  function yTextObserveHandler(event, transaction) {
    const { origin } = transaction;
    console.log(
      transaction,
      "yText.transaction()",
      origin instanceof WebsocketProvider
    );
    if (origin instanceof WebsocketProvider) {
      handleChange(yText.toString());
      console.log(yText.toString(), "yText.toString()");
      // handleChange(yText.toString() || "");
      // const absPos1 = Y.createAbsolutePositionFromRelativePosition(
      //   relPos1,
      //   yDoc
      // );
      // const absPos2 = Y.createAbsolutePositionFromRelativePosition(
      //   relPos2,
      //   yDoc
      // );
      // latex.setSelectionRange(absPos1?.index || 0, absPos2?.index || 0);
    }
  }

  function handleInput(e) {
    console.log(e, "e");
    const { action, lines, start } = e;
    const position = start.row * start.column; // 计算插入位置

    console.log(action, "inputType");
    const newVal = getVal();
    const newRange = getRange();
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

  function handleKeyDown(e) {
    console.log(e, "123");
    setRange();
  }

  function handleSelectionChange() {
    awareness.setLocalStateField("selectionRange", getRange());
  }

  if (latex) {
    console.log(latex, latex.getSession(), "1231");
    latex.getSession().on("change", handleInput);
    // latex.getSession().on("keydown", handleKeyDown);
    // document.addEventListener("selectionchange", handleSelectionChange);
  }

  function beforeTransactionListener() {
    const beforeRange = getRange();
    relPos1 = Y.createRelativePositionFromTypeIndex(yText, beforeRange[0]);
    relPos2 = Y.createRelativePositionFromTypeIndex(yText, beforeRange[1]);
  }

  yText.observe(yTextObserveHandler);
  yDoc.on("beforeAllTransactions", beforeTransactionListener);

  return [
    yDoc,
    yText,
    () => {
      latex.getSession().off("change", handleInput);
      // latex.getSession().off("keydown", handleKeyDown);
      // document.removeEventListener("selectionchange", handleSelectionChange);
      yText.unobserve(yTextObserveHandler);
      yDoc.off("beforeAllTransactions", beforeTransactionListener);
    },
  ];
}

export default latexSyncToYText;
