import { createMutex } from "lib0/mutex.js";
import * as Y from "yjs"; // eslint-disable-line
import { Awareness } from "y-protocols/awareness.js"; // eslint-disable-line
import Ace from "ace-builds/src-min-noconflict/ace";
import { isNullOrUndefined } from "@/utils";
import { useFileStore } from "@/store";

const Range = Ace.require("ace/range").Range;

class AceCursors {
  constructor(ace, localUser, userList) {
    this.marker = {};
    this.markerID = {};
    this.markerCursors = [];
    this.aceID = null; // Ace container ID will be set dynamically
    this.localUser = localUser;

    // Bind the marker update function to this context
    this.marker.update = (html, markerLayer, session, config) => {
      setTimeout(() => {
        this.markerUpdate(html, markerLayer, session, config, ace, userList);      }, 100);
    };
  }

  init(ace, currentFilePath) {
    this.aceID = ace.container.id;
    this.marker.session = ace.getSession();
    this.marker.session.addDynamicMarker(this.marker, true);
    this.currentFilePath = currentFilePath;
  }

  redraw() {
    this.marker.session._signal("changeFrontMarker");
  }

  markerUpdate(html, markerLayer, session, config, ace, userList) {
    let start = config.firstRow,
      end = config.lastRow; //视图显示区域
    let cursors = this.markerCursors;

    for (let i = 0; i < cursors.length; i++) {
      if (this.localUser?.id == cursors[i].userId) continue;
      let pos = cursors[i];
      if (!cursors[i]?.color) {
        pos = {
          ...pos,
          color: userList?.find((user) => user.id == cursors[i].userId).color,
        };
      }

      if (
        pos.row < start ||
        pos.row > end ||
        pos?.currentFilePath != this.currentFilePath ||
        isNullOrUndefined(pos.row) ||
        isNullOrUndefined(pos.column)
      ) {
        let el = document.getElementById(this.aceID + "_cursor_" + pos.userId);

        if (el) {
          el.style.opacity = 0;
        }
        continue;
      } else {
        let screenPos = session.documentToScreenPosition(pos.row, pos.column);
        let aceGutter =
          document.getElementsByClassName("ace_gutter")[0].offsetWidth;
        let height = config.lineHeight;
        let width = config.characterWidth;
        let top = markerLayer.$getTop(screenPos.row, config) - config.offset;
        let left = markerLayer.$padding + aceGutter + screenPos.column * width;

        let el = document.getElementById(this.aceID + "_cursor_" + pos.userId);
        if (el == undefined) {
          el = document.createElement("div");
          el.id = this.aceID + "_cursor_" + pos.userId;
          el.className = "cursor";
          el.style.position = "absolute";
          el.style.height = height + "px";
          el.style.width = width + "px";
          el.style.top = top + "px";
          el.style.left = left + "px";
          el.style.borderLeft = "2px solid " + pos.color;
          el.style.zIndex = 9999;
          el.style.color = "#000";
          el.style.opacity = 1;
          el.addEventListener("mouseenter", function () {
            var cursorLabel = document.createElement("div");
            cursorLabel.className = "cursor-label";
            cursorLabel.style.background = pos.color;
            cursorLabel.style.top = "0";
            cursorLabel.style.whiteSpace = "nowrap";
            cursorLabel.textContent = pos.name;
            cursorLabel.style.display = "inline-block";
            cursorLabel.style.transform = `translateY(-${
              config.lineHeight + 4
            }px)`;
            cursorLabel.style.zIndex = 9999;
            cursorLabel.style.borderRadius = "5px"; // 添加圆角
            cursorLabel.style.padding = "2px 4px"; // 添加内边距以提高可读性
            cursorLabel.style.boxShadow = "0 1px 3px rgba(0,0,0,0.2)"; // 添加阴影以提高可见性
            el.appendChild(cursorLabel);
          });
          el.addEventListener("mouseleave", function () {
            var cursorLabel = el.querySelector(".cursor-label");
            if (cursorLabel) {
              el.removeChild(cursorLabel);
            }
          });
          ace.container.appendChild(el); // Use ace to append the cursor element
        } else {
          el.style.height = height + "px";
          el.style.width = width + "px";
          el.style.top = top + "px";
          el.style.left = left + "px";
          el.style.borderLeft = "2px solid " + pos.color;
          el.style.zIndex = 100;
          el.style.color = "#000";
          el.style.opacity = 1;
        }
      }
    }
  }

  updateCurrentFilePath(currentFilePath) {
    this.currentFilePath = currentFilePath;
  }

  updateCursors(cur, cid, ace) {
    if (cur !== undefined && cur.hasOwnProperty("cursor") && !!cur?.cursor) {
      let c = cur.cursor;

      let curCursor = cur.cursor;

      if (c.sel) {
        if (
          this.markerID[c.id] !== undefined &&
          this.markerID[c.id].hasOwnProperty("sel") &&
          this.markerID[c.id].sel !== undefined
        ) {
          ace.session?.removeMarker(this.markerID[c.id].sel);
          this.markerID[c.id].sel = undefined;
        }

        let anchor = ace.getSession().doc.indexToPosition(c.anchor);
        let head = ace.getSession().doc.indexToPosition(c.head);

        let customStyle = document.getElementById("style_" + c.id);
        if (customStyle) {
          customStyle.innerHTML =
            ".selection-" +
            c.id +
            " { position: absolute; z-index: 20; opacity: 0.5; background: " +
            c.color +
            "; }";
        } else {
          let style = document.createElement("style");
          style.type = "text/css";
          style.id = "style_" + c.id;
          document.getElementsByTagName("head")[0].appendChild(style);
        }

        this.markerID[c.id] = {
          id: c.id,
          sel: ace.session.addMarker(
            new Range(anchor.row, anchor.column, head.row, head.column),
            "selection-" + c.id,
            "text"
          ),
        };
      } else {
        if (
          this.markerID[c.id] !== undefined &&
          this.markerID[c.id].hasOwnProperty("sel") &&
          this.markerID[c.id].sel !== undefined
        ) {
          ace.session?.removeMarker(this.markerID[c.id].sel);
          this.markerID[c.id].sel = undefined;
        }
      }

      const index = this.markerCursors.findIndex(
        (item) => item.userId === curCursor.userId
      );

      if (index !== -1) {
        // 如果存在，替换原有元素
        this.markerCursors[index] = curCursor;
      } else {
        // 如果不存在，添加新元素
        this.markerCursors.push(curCursor);
      }
    } else {
      let el = document.getElementById(this.aceID + "_cursor_" + cid);

      if (el) {
        el.parentNode.removeChild(el);
        if (
          this.markerID[cid] !== undefined &&
          this.markerID[cid].hasOwnProperty("sel") &&
          this.markerID[cid].sel !== undefined
        ) {
          ace.session.removeMarker(this.markerID[cid].sel);
          this.markerID[cid].sel = undefined;
        }
      }
    }
  }
}

export class AceBinding {
  /**
   * @param {Awareness} [awareness]
   */
  constructor(awareness) {
    const mux = createMutex();
    this.mux = mux;
    this.aceCursors = null;
    this.added = [];
    this.userList = [];

    this.awareness = awareness;
    this.handleAwarenessChange = async (ace, notUpdateSelf = true) => {
      this.aceCursors.marker.cursors = [];
      const states = /** @type {Awareness} */ (this.awareness).getStates();

      Promise.all([
        ...Array.from(states.keys()).map((id) => {
          if (this.awareness.clientID == id && notUpdateSelf) return;

          this.aceCursors.updateCursors(states.get(id), id, ace);
        }),
      ]).then(() => {
        this.aceCursors.redraw();
      });
    };

    this._awarenessChange = ({ added, removed, updated }, ace) => {
      this.aceCursors.marker.cursors = [];
      const states = /** @type {Awareness} */ (this.awareness).getStates();

      Promise.all([
        ...added.map((id) => {
          this.aceCursors.updateCursors(states.get(id), id, ace);
        }),
        ...updated.map((id) => {
          if (this.awareness.clientId == id) return;
          this.aceCursors.updateCursors(states.get(id), id, ace);
        }),
        ...removed.map((id) => {
          this.aceCursors.updateCursors(states.get(id), id, ace);
        }),
      ]).then((res) => {
        this.updateShareUserList(states);
        this.aceCursors.redraw();
      });
    };

    this._cursorObserver = (ace) => {
      let user = this.awareness.getLocalState().user; // 获取本地用户信息
      let curSel = ace.getSession().selection;

      let cursor = {
        id: this.awareness.clientID,
        userId: user.id,
        name: user.name,
        sel: true,
        color: user.color,
        currentFilePath: this.currentFilePath,
      };

      let indexAnchor = ace
        .getSession()
        .doc.positionToIndex(curSel.getSelectionAnchor());
      let indexHead = ace
        .getSession()
        .doc.positionToIndex(curSel.getSelectionLead());
      cursor.anchor = indexAnchor;
      cursor.head = indexHead;
      if (indexAnchor > indexHead) {
        cursor.anchor = indexHead;
        cursor.head = indexAnchor;
      }

      cursor.pos = cursor.head;

      if (cursor.anchor === cursor.head) {
        cursor.sel = false;
      }

      const isFocus = ace.isFocused();

      let newPos = ace.getSession().doc.indexToPosition(cursor.pos);
      let isNot0 = newPos.row == 0 && newPos.column == 0 && !isFocus;

      cursor.row = isNot0 ? undefined : newPos.row;
      cursor.column = isNot0 ? undefined : newPos.column;

      const aw = /** @type {any} */ (this.awareness.getLocalState());
      if (curSel === null) {
        if (this.awareness.getLocalState() !== null) {
          this.awareness.setLocalStateField(
            "cursor",
            /** @type {any} */ (null)
          );
        }
      } else {
        if (
          !aw ||
          !aw.cursor ||
          cursor.anchor !== aw.cursor.anchor ||
          cursor.head !== aw.cursor.head
        ) {
          this.awareness.setLocalStateField("cursor", cursor);
        }
      }
    };
  }

  updateShareUserList(states) {
    let uniqueUsers = [];
    let currentUsersId = [];

    for (let [id, state] of states) {
      if (state && state.user) {
        if (!currentUsersId.includes(state.user.id)) {
          currentUsersId.push(state.user.id);
          uniqueUsers.push({
            ...state.user,
          });
        }
      }
    }

    // 将 Set 转换为数组，并解析 JSON 字符串回对象
    this.userList = uniqueUsers;

    useFileStore.getState().updateShareUserList(this.userList);
  }

  init(ace, currentFilePath) {
    this.aceCursors = new AceCursors(ace, this.awareness.getLocalState().user);
    this.aceCursors.init(ace, currentFilePath);
    ace.session.getUndoManager().reset();
    this.currentFilePath = currentFilePath;

    this.cursorChangeHandler = () => {
      this.mux(() => this._cursorObserver(ace));
    };

    ace.getSession().selection.on("changeCursor", this.cursorChangeHandler);

    this.offChangeCursor = () => {
      ace.getSession().selection.off("changeCursor", this.cursorChangeHandler);
    };

    this.awarenessChangeHandler = (e) => {
      this._awarenessChange(e, ace);
    };

    this.offAwarenessChange = () => {
      this.awareness.off("change", this.awarenessChangeHandler);
    };

    if (this.awareness) {
      this.awareness.on("change", this.awarenessChangeHandler);
    }
  }

  updateCurrentFilePath(currentFilePath, editor) {
    this.currentFilePath = currentFilePath;
    this.aceCursors.updateCurrentFilePath(currentFilePath);
    setTimeout(() => {
      this.awareness.setLocalStateField("cursor", null);
      this.handleAwarenessChange && this.handleAwarenessChange(editor, false);
    }, 200);
  }

  destroy() {
    this.offAwarenessChange();
    this.offChangeCursor();
    if (this.awareness) {
      this.awareness.setLocalStateField("cursor", null);
    }
  }
}
