import hljs from 'highlight.js';

import "highlight.js/lib/languages/latex";
import "highlight.js/styles/monokai-sublime.css";
import 'highlight.js/styles/color-brewer.css'


// hljs.registerLanguage("latex", latex)

// hljs.configure({
//     languages: ['latex']
// });

hljs.configure({
    // noHighlightRe: /^do-not-highlightme$/i,
    // languageDetectRe: /\bgrammar-([\w-]+)\b/i, // for `grammar-swift` style CSS naming
    // classPrefix: '',     // don't append class prefix
    // … other options aren't changed
    languages: ['latex']
});

window.hljs = hljs;