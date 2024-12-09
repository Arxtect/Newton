import { createMutex } from "lib0/mutex.js";
import * as Y from "yjs";
import Ace from "ace-builds/src-min-noconflict/ace";
const Range = Ace.require("ace/range").Range;

export class LatexSyncToYText {
  constructor(yText, filepath, ace, changeInitial, initialized) {
    const mux = createMutex();
    this.mux = mux;
    this.type = yText;
    this.ace = ace;
    this.ace.session.getUndoManager().reset();
    this.initialized = initialized;

    this._typeObserver = (event) => {
      console.log(this.initialized, "op.retain");
      if (!this.initialized) {
        // Skip initial insert
        this.initialized = true;
        changeInitial();
        return;
      }

      const aceDocument = this.ace.getSession().getDocument();
      mux(() => {
        const delta = event.delta;
        let currentPos = 0;
        for (const op of delta) {
          console.log(op, "op.retain");
          if (op.retain) {
            currentPos += op.retain;
          } else if (op.insert) {
            const start = aceDocument.indexToPosition(currentPos, 0);
            console.log(start, op.insert, filepath, "op.retain1");
            aceDocument.insert(start, op.insert);
            // aceDocument.insert(start, "op.insert");
            currentPos += op.insert?.length;
          } else if (op.delete) {
            const start = aceDocument.indexToPosition(currentPos, 0);
            const end = aceDocument.indexToPosition(currentPos + op.delete, 0);
            const range = new Range(
              start.row,
              start.column,
              end.row,
              end.column
            );
            aceDocument.remove(range);
          }
        }
      });
    };
    this.type.observe(this._typeObserver);

    this._aceObserver = (eventType, delta) => {
      const aceDocument = this.ace.getSession().getDocument();
      this.mux(() => {
        if (eventType.action === "insert") {
          const start = aceDocument.positionToIndex(eventType.start, 0);
          this.type.insert(start, eventType.lines.join("\n"));
          // this.type.insert(start, "11");
          console.log(
            eventType.start,
            start,
            eventType.lines.join("\n"),
            "op.retain3"
          );
        } else if (eventType.action === "remove") {
          const start = aceDocument.positionToIndex(eventType.start, 0);
          const length = eventType.lines.join("\n")?.length;

          // Ensure the range is valid
          if (start >= 0 && start + length <= this.type.toString()?.length) {
            this.type.delete(start, length);
          } else {
            console.warn("Invalid delete range:", { start, length });
          }
        }
      });
    };

    this.ace.on("change", this._aceObserver);
  }

  destroy() {
    console.log("destroyed");
    this.type && this.type.unobserve(this._typeObserver);
    this.ace && this.ace.off("change", this._aceObserver);
  }
}
