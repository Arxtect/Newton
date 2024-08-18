import _ from 'lodash';
import CommandManager from './CommandManager';
import EnvironmentManager from './EnvironmentManager';
import PackageManager from './PackageManager';
import Helpers from './Helpers';
import ace from "ace-builds/src-noconflict/ace";
import * as graphics from "./utils/graphics";
import * as preamble from "./utils/preamble";
import * as files from "./utils/files";

const { Range } = ace.require('ace/range');
const aceSnippetManager = ace.require('ace/snippets').snippetManager;
const langTools = ace.require("ace/ext/language_tools");

class AutoCompleteManager {
  constructor(editor, options = {}) {
    this.editor = editor;
    // this.metadataManager = options.metadataManager;
    this.graphics = graphics;
    this.preamble = preamble;
    this.files = files;
    this.references = options.references || {};
    this.fontSize = options.fontSize || 14;
    this.autoComplete = options.autoComplete || false;
    this.fileList = options.fileList || [];
    this.editorValue = options.editorValue || '';

    // this.monkeyPatchAutocomplete();

    if (this.autoComplete) {
      this.enable();
    } else {
      this.disable();
    }

    const onChange = change => {
      this.onChange(change)
    }
    // console.log(this.editor.session,this.editor,'changeSession')
    // this.editor.on('changeSession', e => {
    //   console.log('e', e,this.editor.session)
    //   e.oldSession.off('change', onChange)
    //   e.session.on('change', onChange)
    // })
    this.editor.selection.on("changeCursor", onChange);
    // this.editor.commands.on("afterExec", function (e) {
    //   if (e.command.name === "insertstring" && /[{}]/.test(e.args)) {
    //     onChange();
    //   }
    // });
  }
  

  enable() {
    this.editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: false,
    });

    console.log("enable autocomplete")

    // const CommandCompleter = new CommandManager(this.metadataManager);
    const SnippetCompleter = new EnvironmentManager();
    // const PackageCompleter = new PackageManager(this.metadataManager, Helpers);

    const GraphicsCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const { commandFragment } = Helpers.getContext(editor, pos);
        if (commandFragment) {
          const match = commandFragment.match(/^~?\\(includegraphics(?:\[.*])?){([^}]*, *)?(\w*)/);
          if (match) {
            const commandName = match[1];
            const graphicsPaths = this.preamble.getGraphicsPaths(this.editorValue);
            const result = [];
            for (const graphic of this.graphics.getGraphicsFiles(this.fileList)) {
              let { path } = graphic;
              for (const graphicsPath of graphicsPaths) {
                if (path.indexOf(graphicsPath) === 0) {
                  path = path.slice(graphicsPath.length);
                  break;
                }
              }
              result.push({
                caption: `\\${commandName}{${path}}`,
                value: `\\${commandName}{${path}}`,
                meta: 'graphic',
                score: 50,
              });
            }
            callback(null, result);
          }
        }
      },
    };

    const FilesCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const { commandFragment } = Helpers.getContext(editor, pos);
        if (commandFragment) {
          const match = commandFragment.match(/^\\(input|include){(\w*)/);
          if (match) {
            const commandName = match[1];
            const result = [];
            for (const file of this.files.getTeXFiles(this.fileList)) {
              if (file.path) {
                const { path } = file;
                const cleanPath = path.replace(/(.+)\.tex$/i, '$1');
                result.push({
                  caption: `\\${commandName}{${path}}`,
                  value: `\\${commandName}{${cleanPath}}`,
                  meta: 'file',
                  score: 50,
                });
              }
            }
            callback(null, result);
          }
        }
      },
    };

    const LabelsCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const { commandFragment } = Helpers.getContext(editor, pos);
        if (commandFragment) {
          const refMatch = commandFragment.match(/^~?\\([a-zA-Z]*ref){([^}]*, *)?(\w*)/);
          if (refMatch) {
            const commandName = refMatch[1];
            const result = [];
            if (commandName !== 'ref') {
              result.push({
                caption: `\\${commandName}{}`,
                snippet: `\\${commandName}{}`,
                meta: 'cross-reference',
                score: 60,
              });
            }
            // for (const label of this.metadataManager.getAllLabels()) {
            //   result.push({
            //     caption: `\\${commandName}{${label}}`,
            //     value: `\\${commandName}{${label}}`,
            //     meta: 'cross-reference',
            //     score: 50,
            //   });
            // }
            callback(null, result);
          }
        }
      },
    };

    const ReferencesCompleter = {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const { commandFragment } = Helpers.getContext(editor, pos);
        if (commandFragment) {
          const citeMatch = commandFragment.match(/^~?\\([a-z]*cite[a-z]*(?:\[.*])?){([^}]*, *)?(\w*)/);
          if (citeMatch) {
            let [_ignore, commandName, previousArgs] = citeMatch;
            if (previousArgs == null) {
              previousArgs = '';
            }
            const previousArgsCaption = previousArgs.length > 8 ? '…,' : previousArgs;
            const result = [];
            result.push({
              caption: `\\${commandName}{}`,
              snippet: `\\${commandName}{}`,
              meta: 'reference',
              score: 60,
            });
            if (this.references.keys && this.references.keys.length > 0) {
              this.references.keys.forEach((key) => {
                if (key != null) {
                  result.push({
                    caption: `\\${commandName}{${previousArgsCaption}${key}}`,
                    value: `\\${commandName}{${previousArgs}${key}}`,
                    meta: 'reference',
                    score: 50,
                  });
                }
              });
              callback(null, result);
            } else {
              callback(null, result);
            }
          }
        }
      },
    };

    this.editor.completers = [
      // CommandCompleter,
      SnippetCompleter,
      // PackageCompleter,
      ReferencesCompleter,
      LabelsCompleter,
      GraphicsCompleter,
      FilesCompleter,
    ];
  }

  disable() {
    this.editor.setOptions({
      enableBasicAutocompletion: false,
      enableSnippets: false,
    });
  }

  onChange = () => {
    const cursorPosition = this.editor.getCursorPosition();
    console.log(cursorPosition,'cursorPosition')
    const session = this.editor.getSession();
    const change = session.getLine(cursorPosition.row);
    const { lineUpToCursor, commandFragment } = Helpers.getContext(this.editor, cursorPosition);

    if (lineUpToCursor.includes('%') && lineUpToCursor[lineUpToCursor.indexOf('%') - 1] !== '\\') {
      return;
    }

    const lastCharIsBackslash = lineUpToCursor.slice(-1) === '\\';
    const lastTwoChars = lineUpToCursor.slice(-2);

    console.log('lastTwoChars', lastTwoChars);

    if (/^\\[^a-zA-Z]$/.test(lastTwoChars)) {
      if (this.editor.completer) {
        this.editor.completer.detach();
      }
      return;
    }

    // if (
    //   change.origin !== 'remote' &&
    //   change.action === 'insert' &&
    //   end.row === cursorPosition.row &&
    //   end.column === cursorPosition.column + 1
    // ) {
    //   if ((commandFragment != null ? commandFragment.length : undefined) > 2 || lastCharIsBackslash) {
    //     setTimeout(() => {
    //       this.editor.execCommand('startAutocomplete');
    //     }, 0);
    //   }
    // }

    const match = change.match(/\\(\w+){}/);
    
    console.log('match', match);
    if (
      match &&
      match[1] &&
      /(begin|end|[a-zA-Z]*ref|usepackage|[a-z]*cite[a-z]*|input|include)/.test(match[1])
    ) {
      setTimeout(() => {
        this.editor.execCommand('startAutocomplete');
      }, 0);
    }
  }

  // monkeyPatchAutocomplete() {
  //   const { Autocomplete } = ace.require('ace/autocomplete');
  //   const Util = ace.require('ace/autocomplete/util');

  //   if (Autocomplete.prototype._insertMatch == null) {
  //     Autocomplete.prototype._insertMatch = Autocomplete.prototype.insertMatch;
  //     Autocomplete.prototype.insertMatch = function (data) {
  //       const { editor } = this;

  //       const pos = editor.getCursorPosition();
  //       const range = new Range(pos.row, pos.column, pos.row, pos.column + 1);
  //       const nextChar = editor.session.getTextRange(range);
  //       if (/^\\\w+(\[[\w\\,=. ]*\])?{/.test(this.completions.filterText) && nextChar === '}') {
  //         editor.session.remove(range);
  //       }

  //       if (data == null) {
  //         const { completions } = this;
  //         const { popup } = this;
  //         data = popup.getData(popup.getRow());
  //         data.completer = {
  //           insertMatch(editor, matchData) {
  //             for (const range of editor.selection.getAllRanges()) {
  //               const leftRange = _.clone(range);
  //               const rightRange = _.clone(range);
  //               const lineUpToCursor = editor.getSession().getTextRange(
  //                 new Range(range.start.row, 0, range.start.row, range.start.column)
  //               );
  //               const commandStartIndex = Helpers.getLastCommandFragmentIndex(lineUpToCursor);
  //               if (commandStartIndex !== -1) {
  //                 leftRange.start.column = commandStartIndex;
  //               } else {
  //                 leftRange.start.column -= completions.filterText.length;
  //               }
  //               editor.session.remove(leftRange);

  //               const lineBeyondCursor = editor.getSession().getTextRange(
  //                 new Range(rightRange.start.row, rightRange.start.column, rightRange.end.row, 99999)
  //               );

  //               if (lineBeyondCursor) {
  //                 const partialCommandMatch = lineBeyondCursor.match(/^([a-zA-Z0-9]+)\{/);
  //                 if (partialCommandMatch) {
  //                   const commandTail = partialCommandMatch[1];
  //                   rightRange.end.column += commandTail.length - completions.filterText.length;
  //                   editor.session.remove(rightRange);
  //                   if (matchData.snippet != null) {
  //                     matchData.snippet = matchData.snippet.replace(/[{[].*[}\]]/, '');
  //                   }
  //                   if (matchData.caption != null) {
  //                     matchData.caption = matchData.caption.replace(/[{[].*[}\]]/, '');
  //                   }
  //                   if (matchData.value != null) {
  //                     matchData.value = matchData.value.replace(/[{[].*[}\]]/, '');
  //                   }
  //                 }
  //                 const inArgument = lineBeyondCursor.match(/^([\w._-]+)\}(.*)/);
  //                 if (inArgument) {
  //                   const argumentRightOfCursor = inArgument[1];
  //                   const afterArgument = inArgument[2];
  //                   if (afterArgument) {
  //                     rightRange.end.column = rightRange.start.column + argumentRightOfCursor.length + 1;
  //                   }
  //                   editor.session.remove(rightRange);
  //                 }
  //               }
  //             }
  //             if (matchData.snippet) {
  //               aceSnippetManager.insertSnippet(editor, matchData.snippet);
  //             } else {
  //               editor.execCommand('insertstring', matchData.value || matchData);
  //             }
  //           },
  //         };
  //       }

  //       Autocomplete.prototype._insertMatch.call(this, data);
  //     };

  //     Autocomplete.startCommand = {
  //       name: 'startAutocomplete',
  //       exec: (editor) => {
  //         if (!editor.completer) {
  //           editor.completer = new Autocomplete();
  //         }
  //         editor.completer.autoInsert = false;
  //         editor.completer.autoSelect = true;
  //         editor.completer.showPopup(editor);
  //         editor.completer.cancelContextMenu();
  //         const container =editor.completer.popup != null ? editor.completer.popup.container : undefined;
  //         container.css({ 'font-size': `${this.fontSize}px` });

  //         const filtered = editor.completer.completions && editor.completer.completions.filtered;
  //         if (filtered) {
  //           const longestCaption = _.max(filtered.map((c) => c.caption.length));
  //           const longestMeta = _.max(filtered.map((c) => c.meta.length));
  //           const charWidth = editor.renderer.characterWidth;
  //           const width = Math.max(
  //             Math.min(Math.round(longestCaption * charWidth + longestMeta * charWidth + 5 * charWidth), 700),
  //             280
  //           );
  //           container.css({ width: `${width}px` });
  //         }
  //         if (filtered.length === 0) {
  //           editor.completer.detach();
  //         }
  //       },
  //       bindKey: 'Ctrl-Space|Ctrl-Shift-Space|Alt-Space',
  //     };
  //   }

  //   Util.retrievePrecedingIdentifier = function (text, pos, regex) {
  //     let currentLineOffset = 0;
  //     for (let i = pos - 1; i <= 0; i++) {
  //       if (text[i] === '\n') {
  //         currentLineOffset = i + 1;
  //         break;
  //       }
  //     }
  //     const currentLine = text.slice(currentLineOffset, pos);
  //     const fragment = Helpers.getLastCommandFragment(currentLine) || '';
  //     return fragment;
  //   };
  // }
}

export default AutoCompleteManager;