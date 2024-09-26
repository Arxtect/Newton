class EditorStateManager {
  constructor(editor, filepath) {
    this.editor = editor;
    this.filepath = filepath;
    this.SCROLL_POSITION_KEY = "scrollPosition";
    this.CURSOR_POSITION_KEY = "cursorPosition";

    this.handleScroll = this.handleScroll.bind(this);
    this.handleCursorChange = this.handleCursorChange.bind(this);
    this.handleFocus = this.handleFocus.bind(this);
    this.handleBlur = this.handleBlur.bind(this);

    this.isFocused = false;

    if (this.editor) {
      this.editor.session.on("changeScrollTop", this.handleScroll);
      this.editor.selection.on("changeCursor", this.handleCursorChange);
      this.editor.on("focus", this.handleFocus);
      this.editor.on("blur", this.handleBlur);
    }
  }

  loadState() {
    const savedScrollPosition =
      JSON.parse(sessionStorage.getItem(this.SCROLL_POSITION_KEY)) || {};
    const savedCursorPosition =
      JSON.parse(sessionStorage.getItem(this.CURSOR_POSITION_KEY)) || {};

    return {
      scrollPosition: savedScrollPosition[this.filepath] || { scrollTop: 0 },
      cursorPosition: savedCursorPosition[this.filepath] || {
        row: 0,
        column: 0,
      },
    };
  }

  applyState() {
    const { scrollPosition, cursorPosition } = this.loadState();

    if (this.editor) {
      const session = this.editor.getSession();
      session.setScrollTop(scrollPosition.scrollTop || 0);
      session.selection.moveCursorTo(cursorPosition.row, cursorPosition.column);
      this.editor.focus();
    }
  }

  handleScroll() {
    if (this.editor) {
      const session = this.editor.getSession();
      const scrollTop = session.getScrollTop();
      const newScrollPosition = { scrollTop };

      sessionStorage.setItem(
        this.SCROLL_POSITION_KEY,
        JSON.stringify({
          ...JSON.parse(
            sessionStorage.getItem(this.SCROLL_POSITION_KEY) || "{}"
          ),
          [this.filepath]: newScrollPosition,
        })
      );
    }
  }

  handleCursorChange() {
    if (this.editor && this.isFocused) {
      const cursorPosition = this.editor.getCursorPosition();
      sessionStorage.setItem(
        this.CURSOR_POSITION_KEY,
        JSON.stringify({
          ...JSON.parse(
            sessionStorage.getItem(this.CURSOR_POSITION_KEY) || "{}"
          ),
          [this.filepath]: cursorPosition,
        })
      );
    }
  }

  handleFocus() {
    this.isFocused = true;
  }

  handleBlur() {
    this.isFocused = false;
  }

  updateFilePath(filepath) {
    this.filepath = filepath;
    this.applyState();
  }

  destroy() {
    if (this.editor) {
      this.editor.session.off("changeScrollTop", this.handleScroll);
      this.editor.selection.off("changeCursor", this.handleCursorChange);
      this.editor.off("focus", this.handleFocus);
      this.editor.off("blur", this.handleBlur);
    }
  }
}

export default EditorStateManager;
