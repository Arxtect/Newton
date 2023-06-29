import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

function latexSyncToYText({ yText, latex, undoManager, awareness }) {
  let range = [0, 0];
  let relPos1 = Y.createRelativePositionFromTypeIndex(yText, range[0]);
  let relPos2 = Y.createRelativePositionFromTypeIndex(yText, range[1]);

  function getVal() {
    return latex?.getValue() || "";
  }

  let val = getVal();

  function setVal() {
    val = getVal();
    return val;
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
    if (origin instanceof WebsocketProvider) {
      latex.setValue(yText.toString());
      const absPos1 = Y.createAbsolutePositionFromRelativePosition(
        relPos1,
        yDoc
      );
      const absPos2 = Y.createAbsolutePositionFromRelativePosition(
        relPos2,
        yDoc
      );
      // latex.setSelectionRange(absPos1?.index || 0, absPos2?.index || 0);
    }
  }

  function handleInput(e) {
    console.log(e, "e");
    const { action, lines } = e;
    console.log(action, "inputType");
    const newVal = getVal();
    const newRange = getRange();
    if (action == "insert") {
      yDoc.transact(() => {
        if (range[0] !== range[1]) {
          const deleteLength = range[1] - range[0];
          yText.delete(range[0], deleteLength);
        }
        // yText.insert(range[0], lines || "");
      }, yDoc.clientID);
    } else if (action == "delete") {
      yDoc.transact(() => {
        yText.delete(newRange[0], val.length - newVal.length);
      }, yDoc.clientID);
    } else if (action === "historyUndo") {
      undoManager.undo();
    } else if (action === "historyRedo") {
      undoManager.redo();
    }
    // latex.setValue(yText.toString());
    // console.log(yText.toString(), "12312");
    // latex.setSelectionRange(newRange[0], newRange[1]);
  }

  function handleKeyDown(e) {
    console.log(e, "123");
    setRange();
    setVal();
  }

  function handleSelectionChange() {
    awareness.setLocalStateField("selectionRange", getRange());
  }

  if (latex) {
    console.log(latex, latex.getSession(), "1231");
    latex.getSession().on("change", handleInput);
    latex.getSession().on("keydown", handleKeyDown);
    // document.addEventListener("selectionchange", handleSelectionChange);
  }

  function beforeTransactionListener() {
    const beforeRange = getRange();
    relPos1 = Y.createRelativePositionFromTypeIndex(yText, beforeRange[0]);
    relPos2 = Y.createRelativePositionFromTypeIndex(yText, beforeRange[1]);
  }

  yText.observe(yTextObserveHandler);
  yDoc.on("beforeAllTransactions", beforeTransactionListener);

  return () => {
    latex.getSession().off("input", handleInput);
    latex.getSession().off("keydown", handleKeyDown);
    // document.removeEventListener("selectionchange", handleSelectionChange);
    yText.unobserve(yTextObserveHandler);
    yDoc.off("beforeAllTransactions", beforeTransactionListener);
  };
}

export default latexSyncToYText;
