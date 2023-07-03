import * as Y from 'yjs';
import { QuillBinding } from "y-quill";
import { WebsocketProvider } from "y-websocket";

const YJS_SERVER = 'ws://10.10.99.98:9000';
const ROOM = 'late1x-quill-dev';

class Ydoc {
    #ydoc = new Y.Doc();
    #provider = new WebsocketProvider(YJS_SERVER, ROOM, this.#ydoc);
    #type;
    constructor() {
        this.#type = this.#ydoc.getText(ROOM);
        this.#provider.awareness.setLocalStateField('user', {
            name: this.#getRandomUsername(),
            color: this.#getCursorColor()
        })
    }

    #getRandomUsername = () => {
        return `User_${Math.random().toString(36).slice(2, 7)}`;
    }

    #getCursorColor = () => {
        const colors = ['blue', 'red', 'orange', 'green'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    bindEditor(editor) {
        new QuillBinding(this.#type, editor, this.#provider.awareness);
    }
}

export default Ydoc;