import ace from "ace-builds/src-noconflict/ace";
import { readFile } from "domain/filesystem";
import EnvironmentManager from "./EnvironmentManager";
import CommandManager from "./CommandManager";
import PackageManager from "./PackageManager";
import * as files from "./utils/files";
import path from "path";
import { removeTexExtension } from "./snippets/buildIncludeCompletions";

const CHUNK_SIZE = 1000; // 每次处理1000行

class CustomCompleter {
  constructor(
    editor,
    fileList,
    bibFilePathList,
    filepath,
    currentProjectRoot,
    autoComplete = true
  ) {
    this.currentFilePath = filepath;
    this.editor = editor;
    this.fileList = fileList;
    this.bibFilePathList = bibFilePathList;
    this.langTools = ace.require("ace/ext/language_tools");
    this.textCompleter = this.langTools.textCompleter;
    this.currentProjectRoot = currentProjectRoot;
    this.inputCustomCompleter = this.createInputCustomCompleter(
      fileList,
      filepath
    );
    this.includeGraphicsCustomCompleter =
      this.createIncludeGraphicsCompleter(fileList);

    this.citeCustomCompleter = null;
    this.environmentManager = new EnvironmentManager();
    this.commandManager = new CommandManager(fileList);
    this.packageManager = new PackageManager(this.fileList);
    this.isInit = false;
    this.autoComplete = autoComplete;

    if (this.autoComplete) {
      this.enable();
    } else {
      this.disable();
    }
  }

  enable() {
    this.editor.setOptions({
      enableBasicAutocompletion: true,
      enableSnippets: true,
      enableLiveAutocompletion: false,
    });
    this.init();
  }

  disable() {
    this.editor.setOptions({
      enableBasicAutocompletion: false,
      enableSnippets: false,
    });
  }

  async init() {
    const citations = await this.parseBibFile(this.bibFilePathList);
    this.labelCustomCompleter = await this.createLabelCompleter(this.fileList);
    this.citeCustomCompleter = this.createCiteCompleter(citations);
    this.langTools.addCompleter(this.inputCustomCompleter);
    this.langTools.addCompleter(this.citeCustomCompleter);
    this.langTools.addCompleter(this.labelCustomCompleter);
    this.setupTrigger();
    this.isInit = true;
  }

  async changeCitationCompleter(bibFilePathList) {
    this.bibFilePathList = bibFilePathList;
    const citations = await this.parseBibFile(this.bibFilePathList);
    this.citeCustomCompleter = this.createCiteCompleter(citations);
  }

  changeCurrentFilePath(filepath) {
    this.currentFilePath = filepath;
    this.inputCustomCompleter = this.createInputCustomCompleter(
      this.fileList,
      filepath
    );
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

  createInputCustomCompleter(fileList, currentFilePath) {
    return {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const line = session.getLine(pos.row);
        const match = /\\(input|include)\{[^}]*\}/.test(line);

        const fileExt = path.extname(currentFilePath);
        const isTex = fileExt === ".tex";
        console.log("isTex", isTex);
        if (match && isTex) {
          const completions = files.getTeXFiles(fileList)?.map((file) => ({
            caption: file.path,
            value: removeTexExtension(file.path),
            meta: "file",
          }));
          callback(null, completions);
        } else {
          callback(null, []);
        }
      },
    };
  }

  createIncludeGraphicsCompleter(fileList) {
    return {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const line = session.getLine(pos.row);
        const match = /\\includegraphics(\[[^\]]*\])?\{[^}]*\}/.test(line);

        if (match) {
          const completions = files.getImageFiles(fileList)?.map((file) => ({
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

  async createLabelCompleter(fileList) {
    let labels = await files.extractLabelsFromTexFiles(
      fileList,
      this.currentProjectRoot
    );
    return {
      getCompletions: (editor, session, pos, prefix, callback) => {
        const line = session.getLine(pos.row);
        const match = /\\ref\{[^}]*\}/.test(line);
        if (match) {
          const completions = labels.map((label) => ({
            caption: label,
            value: label,
            meta: "label",
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
        insideBraces:
          /\\(input|include)\{[^}]*$/.test(beforeCursor) &&
          /^[^}]*\}/.test(afterCursor),
        completer: this.inputCustomCompleter,
      },
      {
        match: /\\includegraphics(\[[^\]]*\])?\{.*?\}/,
        insideBraces:
          /\\includegraphics(\[[^\]]*\])?\{[^}]*$/.test(beforeCursor) &&
          /^[^}]*\}/.test(afterCursor),
        completer: this.includeGraphicsCustomCompleter,
      },
      {
        match: /\\ref\{.*?\}/,
        insideBraces:
          /\\ref\{[^}]*$/.test(beforeCursor) && /^[^}]*\}/.test(afterCursor),
        completer: this.labelCustomCompleter,
      },
      {
        match: /\\cite\{.*?\}/,
        insideBraces:
          /\\cite\{[^}]*$/.test(beforeCursor) && /^[^}]*\}/.test(afterCursor),
        completer: this.citeCustomCompleter,
      },
      {
        match: /\\begin\{.*?\}/,
        insideBraces:
          /\\begin\{[^}]*$/.test(beforeCursor) && /^[^}]*\}/.test(afterCursor),
        completer: {
          getCompletions: (editor, session, pos, prefix, callback) => {
            this.environmentManager.getCompletions(
              editor,
              session,
              pos,
              prefix,
              callback
            );
          },
        },
      },
      {
        match: /\\usepackage\{.*?\}/,
        insideBraces:
          /\\usepackage\{[^}]*$/.test(beforeCursor) &&
          /^[^}]*\}/.test(afterCursor),
        completer: {
          getCompletions: (editor, session, pos, prefix, callback) => {
            this.packageManager.getCompletions(
              editor,
              session,
              pos,
              prefix,
              callback
            );
          },
        },
      },
      {
        match: /^\\[a-zA-Z]*$/,
        insideBraces: /^\\[a-zA-Z]*$/.test(beforeCursor),
        completer: {
          getCompletions: (editor, session, pos, prefix, callback) => {
            this.commandManager.getCompletions(
              editor,
              session,
              pos,
              prefix,
              callback
            );
          },
        },
      },
    ];

    console.log(line, beforeCursor, /\\/.test(beforeCursor), "123");

    const matchedCompleter = completersList.find(
      (item) => item.match.test(line) && item.insideBraces
    );

    if (matchedCompleter) {
      this.editor.completers = [matchedCompleter.completer];
      this.editor.execCommand("startAutocomplete");
    }

    setTimeout(() => {
      this.editor.completers = [this.textCompleter];
    }, 0);
  }

  onTriggerAutocompleteAfterExec = (e) => {
    if (e.command.name === "insertstring" && /[{}]/.test(e.args)) {
      this.triggerAutocomplete();
    }
  };
  onTriggerAutocompleteChangeCursor = () => {
    console.log("onTriggerAutocompleteChangeCursor");
    this.triggerAutocomplete();
  };

  setupTrigger() {
    this.editor.commands.on("afterExec", this.onTriggerAutocompleteAfterExec);
    this.editor.selection.on(
      "changeCursor",
      this.onTriggerAutocompleteChangeCursor
    );
  }

  offAddEventListener() {
    this.editor.commands.off("afterExec", this.onTriggerAutocompleteAfterExec);
    this.editor.selection.off(
      "changeCursor",
      this.onTriggerAutocompleteChangeCursor
    );
  }

  static shouldTriggerCompletion(line) {
    return /(begin|end|[a-zA-Z]*ref|usepackage|[a-z]*cite[a-z]*|input|include)/.test(
      line
    );
  }
}

export default CustomCompleter;
