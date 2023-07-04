import hljs from 'highlight.js';

import "highlight.js/styles/monokai-sublime.css";

import latex from "highlight.js/lib/languages/latex";
import 'highlight.js/styles/color-brewer.css'

hljs.configure({   // optionally configure hljs
    languages: ['latex']
});

hljs.registerLanguage("latex", latex)

// hljs.configure({
//     // noHighlightRe: /^do-not-highlightme$/i,
//     // languageDetectRe: /\bgrammar-([\w-]+)\b/i, // for `grammar-swift` style CSS naming
//     // classPrefix: '',     // don't append class prefix
//     // … other options aren't changed
//     languages: ['latex']
// });

window.hljs = hljs;