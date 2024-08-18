import ace from "ace-builds/src-noconflict/ace";
import { readFile } from "domain/filesystem";
import EnvironmentManager from "./EnvironmentManager";
import * as files from "./utils/files"
import  path from "path"

const CHUNK_SIZE = 1000; // 每次处理1000行

class CustomCompleter {
  constructor(editor, fileList, bibFilePathList,filepath) {
    this.currentFilePath = filepath
    this.editor = editor;
    this.fileList = fileList;
    this.bibFilePathList = bibFilePathList;
    this.langTools = ace.require("ace/ext/language_tools");
    this.textCompleter = this.langTools.textCompleter;
    this.inputCustomCompleter = this.createInputCustomCompleter(fileList,filepath);
    this.citeCustomCompleter = null;
    this.environmentManager = new EnvironmentManager();
    this.isInit = false;
    this.init();
  }

  async init() {
    const citations = await this.parseBibFile(this.bibFilePathList);
    this.citeCustomCompleter = this.createCiteCompleter(citations);
    this.langTools.addCompleter(this.inputCustomCompleter);
    this.langTools.addCompleter(this.citeCustomCompleter);
    this.setupTrigger();
    this.isInit = true;
  }

  changeCurrentFilePath(filepath){
    this.currentFilePath = filepath
    console.log(this.currentFilePath)
    this.inputCustomCompleter = this.createInputCustomCompleter(this.fileList,filepath);
  }

  async parseBibFile(bibFilePathList) {
    const regex = /@.*?\{(.*?),/g;
    const citations = [];

    for (const filepath of bibFilePathList) {
      try {
        const content = await readFile(filepath, "utf-8");
        if (!content) return [];
        const lines = content?.toString()?.split("\n");
        for (let i = 0; i < lines.length; i += CHUNK_SIZE) {
          const chunk = lines.slice(i, i + CHUNK_SIZE).join("\n");
          let match;
          while ((match = regex.exec(chunk)) !== null) {
            citations.push(match[1]);
          }
        }
      } catch (err) {
        console.error(`Error reading file ${filepath}:`, err);
      }
    }

    return citations;
  }

  createInputCustomCompleter(fileList,currentFilePath) {
    return {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const line = session.getLine(pos.row);
        const match = /\\(input|include)\{.*?\}/.test(line);
        const fileExt = path.extname(currentFilePath);
        const isTex = fileExt === ".tex";
        console.log("isTex", isTex);
        if (match&&isTex) {
          const completions = files.getTeXFiles(fileList)?.map((file) => ({
            caption: file.path,
            value: file.path,
            meta: "file",
          }));
          callback(null, completions);
        } else {
          callback(null, []);
        }
      },
    };
  }

  createCiteCompleter(citations) {
    return {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const line = session.getLine(pos.row);
        const match = /\\cite\{.*?\}/.test(line);
        if (match) {
          const completions = citations.map((citation) => ({
            caption: citation,
            value: citation,
            meta: "reference",
          }));
          callback(null, completions);
        } else {
          callback(null, []);
        }
      },
    };
  }


  triggerAutocomplete() {
    const pos = this.editor.getCursorPosition();
    const session = this.editor.getSession();
    const line = session.getLine(pos.row);
    const beforeCursor = line.slice(0, pos.column);
    const afterCursor = line.slice(pos.column);

    const completersList = [
      {
        match: /\\(input|include)\{.*?\}/,
        insideBraces: /\\(input|include)\{[^}]*$/.test(beforeCursor) && /^[^}]*\}/.test(afterCursor),
        completer: this.inputCustomCompleter,
      },
      {
        match: /\\cite\{.*?\}/,
        insideBraces: /\\cite\{[^}]*$/.test(beforeCursor) && /^[^}]*\}/.test(afterCursor),
        completer: this.citeCustomCompleter,
      },
      {
        match: /\\begin\{.*?\}/,
        insideBraces: /\\begin\{[^}]*$/.test(beforeCursor) && /^[^}]*\}/.test(afterCursor),
        completer: {
          getCompletions: (editor, session, pos, prefix, callback) => {
            this.environmentManager.getCompletions(editor, session, pos, prefix, callback);
          },
        },
      },
    ];

    const matchedCompleter = completersList.find(
      item => item.match.test(line) && item.insideBraces
    );

    if (matchedCompleter) {
      this.editor.completers = [matchedCompleter.completer];
      this.editor.execCommand("startAutocomplete");
    }

    setTimeout(() => {
      this.editor.completers = [
        this.textCompleter,
        this.inputCustomCompleter,
        this.citeCustomCompleter,
      ];
    }, 0);
  }

  onTriggerAutocompleteAfterExec=(e)=> {
    if (e.command.name === "insertstring" && /[{}]/.test(e.args)) {
      this.triggerAutocomplete();
    }
  }
  onTriggerAutocompleteChangeCursor=()=> {
    this.triggerAutocomplete();
  }

  setupTrigger() {
    this.editor.commands.on("afterExec", this.onTriggerAutocompleteAfterExec)
    this.editor.selection.on("changeCursor", this.onTriggerAutocompleteChangeCursor);
  }

  offAddEventListener() {
    this.editor.commands.off("afterExec", this.onTriggerAutocompleteAfterExec);
    this.editor.selection.off("changeCursor", this.onTriggerAutocompleteChangeCursor);
  }

  static shouldTriggerCompletion(line) {
    return /(begin|end|[a-zA-Z]*ref|usepackage|[a-z]*cite[a-z]*|input|include)/.test(line);
  }
}

export default CustomCompleter;