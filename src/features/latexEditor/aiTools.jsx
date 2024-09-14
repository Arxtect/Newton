import React, { useEffect, useState, useRef } from 'react';
import { AiOutlineEdit, AiOutlineQuestionCircle, AiOutlineTranslation, AiOutlinePicture } from 'react-icons/ai';
import { useLayout } from "store";
import { container } from './../../styles';


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

    const {
        sideWidth,
    } = useLayout();

    const handleCommand = (command) => {
        const editor = editorRef.current.editor;
        const cursorPosition = editor.getCursorPosition();
        const session = editor.getSession();
        const line = session.getLine(cursorPosition.row);

        const previousChar = line.charAt(cursorPosition.column - 1);

        // Only remove the / character if it is actually there
        if (previousChar === '/') {
            // Move the cursor back one position
            editor.moveCursorToPosition({ row: cursorPosition.row, column: cursorPosition.column - 1 });
        }

        switch (command) {
            case 'section':
                editor.remove('/');
                editor.insert('\\section{title}\n');
                break;
            case 'itemize':
                editor.remove('/');
                editor.insert('\\begin{itemize}\n  \\item project1\n  \\item project2\n\\end{itemize}\n');
                break;
            default:
                break;
        }
    };

    const sideWidthRef = useRef()

    useEffect(() => {
        sideWidthRef.current = sideWidth
    }, [sideWidth])

    const handleCursorChange = (selection) => {
        const editor = editorRef.current.editor;
        const cursorPosition = editor.getCursorPosition();
        const screenCoordinates = editor.renderer.textToScreenCoordinates(cursorPosition.row, cursorPosition.column);

        const toolbarTop = screenCoordinates.pageY - editor.renderer.layerConfig.lineHeight;
        const toolbarLeft = screenCoordinates.pageX - sideWidthRef.current;

        setToolbarPosition({ top: toolbarTop, left: toolbarLeft });

        const session = editor.getSession();
        const line = session.getLine(cursorPosition.row);
        const previousChar = line.charAt(cursorPosition.column - 1);
        const previousChar2 = line.charAt(cursorPosition.column - 2);

        if (previousChar === '/' && previousChar2 !== "/") {
            setShowDropdown(true);
        } else {
            setShowDropdown(false);
        }
    };
    const handleKeyDown = (event) => {
        const editor = editorRef.current.editor;
        console.log(showDropdown,'showDropdown')
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
        const keydown =(event)=>{
            console.log(event,'event')
        }
        const editor = editorRef.current.editor;
        // Hide the dropdown menu
        editor.container.addEventListener('keyup', keydown);


        return () => {
            editor.container.removeEventListener('keyup', keydown);
        };
    }, [showDropdown, activeIndex]);

    
    useEffect(() => {
        const editor = editorRef.current.editor;
        // Hide the dropdown menu
        editor.session.selection.on('changeCursor', handleCursorChange);

        return () => {
            editor.session.selection.off('changeCursor', handleCursorChange);
        };
    }, [activeIndex]);

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

export default React.memo(AiTools);