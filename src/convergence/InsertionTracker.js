class EditorChangeManager {
  constructor(editor, yDoc, yMap, currentFilePath, currentClientId) {
    this.editor = editor;
    this.yDoc = yDoc;
    this.yMap = yMap;
    this.currentFilePath = currentFilePath;
    this.currentClientId = currentClientId;
    this.changes = new Map();
    this.lastChanges = new Map();
    this.bufferedChanges = [];
    this.debouncedProcessChanges = debounce(
      () => this.processBufferedChanges(),
      0
    );

    this.recordChange = this.recordChange.bind(this);

    // Listen for editor change events
    editor.session.on("change", this.recordChange);
    this.offChange = function () {
      editor.session.off("change", this.recordChange);
    };
  }

  recordChange(delta) {
    const { action, lines, start } = delta;
    const content = lines.join("\n");

    for (let [key, existingChange] of this.lastChanges) {
      console.log(
        content,
        existingChange.content,
        existingChange.content == content,
        "content"
      );
      console.log(existingChange, delta, "existingChange");
      if (
        existingChange.action === action &&
        existingChange.content === content &&
        existingChange.position.row === start.row &&
        existingChange.position.column === start.column
      ) {
        // 如果存在相同的变更，则删除并返回
        // this.lastChanges.delete(key);
        return;
      }
    }

    // Buffer the change
    this.bufferedChanges.push({ action, content, start });

    // Debounce processing of changes
    this.debouncedProcessChanges();
  }

  processBufferedChanges() {
    const groupedChanges = this.groupBufferedChanges();

    groupedChanges.forEach(({ action, content, start }) => {
      const key = `${this.currentFilePath}`;

      if (this.changes.has(key)) {
        const existingChange = this.changes.get(key);

        // Merge consecutive changes
        if (
          existingChange.action === action &&
          existingChange.position.row === start.row &&
          existingChange.position.column + existingChange.content.length ===
            start.column
        ) {
          if (action === "insert") {
            existingChange.content += content;
          } else if (action === "remove") {
            existingChange.content = existingChange.content.slice(
              0,
              -content.length
            );
          }
        } else {
          this.changes.set(key, {
            content,
            position: start,
            action,
            clientId: this.currentClientId,
          });
        }
      } else {
        this.changes.set(key, {
          content,
          position: start,
          action,
          clientId: this.currentClientId,
        });
      }
    });

    // Clear the buffer
    this.bufferedChanges = [];

    console.log("Processed changes:", this.changes);
    this.syncChanges();
  }

  groupBufferedChanges() {
    // Group changes by action and position
    return this.bufferedChanges.reduce((acc, change) => {
      const lastChange = acc[acc.length - 1];

      if (
        lastChange &&
        lastChange.action === change.action &&
        lastChange.start.row === change.start.row &&
        lastChange.start.column + lastChange.content.length ===
          change.start.column
      ) {
        if (change.action === "insert") {
          lastChange.content += change.content;
        } else if (change.action === "remove") {
          lastChange.content = lastChange.content.slice(
            0,
            -change.content.length
          );
        }
      } else {
        acc.push(change);
      }

      return acc;
    }, []);
  }

  syncChanges() {
    console.log("Synchronizing changes:", this.changes);

    // Clear changes after sync
    this.yDoc.transact(() => {
      if (!this.currentClientId) return;
      const stateManageFile = this.yMap.get("state-manage-file") || {};
      const key = `${this.currentFilePath}~${this.currentClientId}`;
      const keyUndefined = `${this.currentFilePath}~undefined`;
            const keyUndefineds = `${this.currentFilePath}-${this.currentClientId}`;
      let changesObject = Object.fromEntries(this.changes);

      // Convert the object to JSON
      const changesJSON = JSON.stringify(Object.values(changesObject));
      stateManageFile[key] = changesJSON;
      delete stateManageFile[keyUndefined];
      delete stateManageFile[keyUndefineds];

      this.yMap.set("state-manage-file", stateManageFile);
    });

    this.lastChanges = this.changes;
    this.changes.clear();
  }

  insertContent(editor, content, position) {
    if (this.isCurrentFile(this.currentFilePath)) {
      editor.session.insert(position, content);
      this.recordChange({
        action: "insert",
        lines: [content],
        start: position,
      });
    }
  }

  isCurrentFile(filePath) {
    return this.currentFilePath === filePath;
  }
}

export { EditorChangeManager };

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}
