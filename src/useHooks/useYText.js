import { useMemo } from "react";
import * as Y from "yjs";

export default function useYText({ name, doc }) {
  const { yDoc, yText, undoManager } = useMemo(() => {
    const _yText = doc.getText(name);
    const _undoManager = new Y.UndoManager(_yText, {
      trackedOrigins: new Set([doc.clientID]),
      captureTimeout: 500,
    });
    window.yText = _yText;
    window.undoManager = _undoManager;
    return { yDoc: doc, yText: _yText, undoManager: _undoManager };
  }, []);

  return { yDoc, yText, undoManager };
}
