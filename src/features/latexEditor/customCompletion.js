// customCompleter.js
import ace from "ace-builds/src-noconflict/ace";
import { readFile } from "domain/filesystem";

// 解析 .bib 文件并提取引用键
const parseBibFile = async (bibFilePathList) => {
  // 如果没有提供文件路径列表，返回空数组
  if (!bibFilePathList || bibFilePathList.length === 0) {
    return [];
  }

  const regex = /@.*?\{(.*?),/g;
  const citations = [];

  // 逐个读取并解析每个 .bib 文件
  for (const filepath of bibFilePathList) {
    try {
      const content = await readFile(filepath, 'utf-8');
      let match;
      while ((match = regex.exec(content)) !== null) {
        citations.push(match[1]);
      }
    } catch (err) {
      console.error(`Error reading file ${filepath}:`, err);
    }
  }

  return citations;
};

const createInputCustomCompleter = (files) => ({
  getCompletions: function (editor, session, pos, prefix, callback) {
    const line = session.getLine(pos.row);
    const match = /\\input\{.*?\}/.test(line);
    console.log(line, match, "match");
    if (match) {
      const completions = files?.map((file) => ({
        caption: file,
        value: file,
        meta: "file",
      }));
      callback(null, completions);
    } else {
      callback(null, []);
    }
  },
});

// 创建 \cite 补全器
const createCiteCompleter = (citations) => ({
  getCompletions: function (editor, session, pos, prefix, callback) {
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
});

const setupCustomCompleter = async (editor, files, bibFilePathList) => {
  const langTools = ace.require("ace/ext/language_tools");
  const textCompleter = langTools.textCompleter;
  const inputCustomCompleter = createInputCustomCompleter(files);
  const citations = await parseBibFile(bibFilePathList);

  const citeCustomCompleter = createCiteCompleter(citations);
  langTools.addCompleter(inputCustomCompleter);
  langTools.addCompleter(citeCustomCompleter);

  const triggerAutocomplete = () => {
    const pos = editor.getCursorPosition();
    const session = editor.getSession();
    const line = session.getLine(pos.row);
    const inputMatch = /\\input\{.*?\}/.test(line);
    const citeMatch = /\\cite\{.*?\}/.test(line);

    // 检查光标是否在花括号内
    const beforeCursor = line.slice(0, pos.column);
    const afterCursor = line.slice(pos.column);
    const insideInputBraces =
      /\\input\{[^}]*$/.test(beforeCursor) && /^[^}]*\}/.test(afterCursor);

    const insideCiteBraces =
      /\\cite\{[^}]*$/.test(beforeCursor) && /^[^}]*\}/.test(afterCursor);

    console.log(
      "asd",
      inputMatch,
      citeMatch,
      insideInputBraces,
      insideCiteBraces
    );

    if (inputMatch && insideInputBraces) {
      // 使用 \input 补全器
      editor.completers = [inputCustomCompleter];
      editor.execCommand("startAutocomplete");
    } else if (citeMatch && insideCiteBraces) {
      // 使用 \cite 补全器
      editor.completers = [citeCustomCompleter];
      editor.execCommand("startAutocomplete");
    }
    setTimeout(() => {
      editor.completers = [
        textCompleter,
        inputCustomCompleter,
        citeCustomCompleter,
      ];
    }, 0);
  };

  // 自定义触发器
  editor.commands.on("afterExec", function (e) {
    if (e.command.name === "insertstring" && /[{}]/.test(e.args)) {
      triggerAutocomplete();
    }
  });

  // 光标移动时触发补全
  editor.selection.on("changeCursor", function () {
    triggerAutocomplete();
  });
};

export { createInputCustomCompleter, setupCustomCompleter };
