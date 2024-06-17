import React, { useEffect, useState } from 'react';
import { AiOutlineEdit, AiOutlineQuestionCircle, AiOutlineTranslation, AiOutlinePicture } from 'react-icons/ai';

const DropdownMenu = ({ options, onSelect, activeIndex }) => {
    return (
        <div className="bg-white border border-gray-300 shadow-md mt-2 z-10">
            {options.map((option, index) => (
                <div
                    key={index}
                    className={`flex items-center gap-2 py-3 w-36 px-4 focus:bg-gray-200 ${index === activeIndex ? 'bg-gray-200' : 'hover:bg-gray-200'} cursor-pointer`}
                    onClick={() => onSelect(option.value)}
                >
                    {option.icon}
                    <span>{option.label}</span>
                </div>
            ))}
        </div>
    );
};

const AiTools = ({ editorRef }) => {
    const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
    const [showDropdown, setShowDropdown] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [originalKeyHandler, setOriginalKeyHandler] = useState(null);

    const handleCommand = (command) => {
        const editor = editorRef.current.editor;
        switch (command) {
            case 'section':
                editor.insert('\\section{章节标题}\n');
                break;
            case 'itemize':
                editor.insert('\\begin{itemize}\n  \\item 项目1\n  \\item 项目2\n\\end{itemize}\n');
                break;
            default:
                break;
        }
    };

    const handleCursorChange = (selection) => {
        const editor = editorRef.current.editor;
        const cursorPosition = editor.getCursorPosition();
        const renderer = editor.renderer;
        const lineHeight = renderer.lineHeight;
        const editorRect = editor.container.getBoundingClientRect();
        const toolbarTop = editorRect.top + (cursorPosition.row - 1) * lineHeight;
        const toolbarLeft = editorRect.left;

        setToolbarPosition({ top: toolbarTop, left: toolbarLeft });

        const session = editor.getSession();
        const line = session.getLine(cursorPosition.row);
        const previousChar = line.charAt(cursorPosition.column - 1);
        const previousChar2 = line.charAt(cursorPosition.column - 2);

        console.log(previousChar2, 'previousChar2')

        if (previousChar === '/' && previousChar2 !== "/") {
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    };

    const handleKeyDown = (event) => {
        const editor = editorRef.current.editor;
        if (showDropdown) {
            event.preventDefault();
            event.stopPropagation();
            if (event.key === 'ArrowDown') {
                setActiveIndex((prevIndex) => (prevIndex + 1) % options.length);
            } else if (event.key === 'ArrowUp') {
                setActiveIndex((prevIndex) => (prevIndex - 1 + options.length) % options.length);
            } else if (event.key === 'Enter') {
                handleCommand(options[activeIndex].value);
                setShowDropdown(false);
            } else {
                if (originalKeyHandler) {
                    editor.keyBinding.setKeyboardHandler(originalKeyHandler);
                    setOriginalKeyHandler(null);
                }
            }
        }
    };

    useEffect(() => {
        const editor = editorRef.current.editor;
        editor.session.selection.on('changeCursor', handleCursorChange);
        editor.container.addEventListener('keyup', handleKeyDown);

        return () => {
            editor.session.selection.off('changeCursor', handleCursorChange);
            editor.container.removeEventListener('keyup', handleKeyDown);
        };
    }, [showDropdown, activeIndex]);

    useEffect(() => {
        const editor = editorRef.current.editor;
        if (showDropdown) {
            setOriginalKeyHandler(editor.keyBinding.getKeyboardHandler());
            editor.keyBinding.addKeyboardHandler({
                handleKeyboard: function (data, hash, keyString, keyCode, event) {
                    if (keyString === 'down' || keyString === 'up' || keyCode === 13) {
                        return { command: 'null', passEvent: false };
                    }
                    // Otherwise, allow default behavior
                    return { command: null, passEvent: true };
                }
            });
        } else {
            if (originalKeyHandler) {
                editor.keyBinding.setKeyboardHandler(originalKeyHandler);
                setOriginalKeyHandler(null);
            }
        }
    }, [showDropdown]);

    const options = [
        { icon: <AiOutlineEdit />, label: 'AI 续写', value: 'section' },
        { icon: <AiOutlineQuestionCircle />, label: 'AI 优化', value: 'itemize' },
        // { icon: <AiOutlinePicture />, label: 'AI 生图', value: 'generate' },
    ];

    return (
        showDropdown && (
            <div
                className="toolbar"
                style={{
                    position: 'absolute',
                    top: toolbarPosition.top + 10,
                    left: toolbarPosition.left,
                    zIndex: 10,
                    display: 'flex',
                    gap: '5px',
                }}
            >
                <DropdownMenu options={options} onSelect={handleCommand} activeIndex={activeIndex} />
            </div>
        )
    );
};

export default AiTools;
