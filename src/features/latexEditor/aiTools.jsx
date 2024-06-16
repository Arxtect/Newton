// Toolbar.jsx
import React, { useEffect, useState } from 'react';
import { AiOutlineEdit, AiOutlineQuestionCircle, AiOutlineTranslation, AiOutlinePicture } from 'react-icons/ai';

const DropdownMenu = ({ options, onSelect, activeIndex }) => {

    return (
        <div className=" bg-white border border-gray-300 shadow-md mt-2 z-10">
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
        const toolbarTop = editorRect.top + (cursorPosition.row + 1) * lineHeight;
        const toolbarLeft = editorRect.left;

        setToolbarPosition({ top: toolbarTop, left: toolbarLeft });
    };

    const handleKeyDown = (event) => {
        const editor = editorRef.current.editor;
        const session = editor.getSession();
        const cursor = editor.getCursorPosition();
        const line = session.getLine(cursor.row);
        const prefix = line.slice(0, cursor.column);


        event.preventDefault(); // 阻止默认行为
        event.stopPropagation(); // 阻止事件冒泡
        if (event.key === '/') {
            setShowDropdown(true);
        } else if (showDropdown) {
            if (event.key === 'ArrowDown') {
                setActiveIndex((prevIndex) => (prevIndex + 1) % options.length);
            } else if (event.key === 'ArrowUp') {
                setActiveIndex((prevIndex) => (prevIndex - 1 + options.length) % options.length);
            } else if (event.key === 'Enter') {
                handleCommand(options[activeIndex].value);
                setShowDropdown(false);
            } else {
                setShowDropdown(false);
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

    const options = [
        { icon: <AiOutlineEdit />, label: 'AI 续写', value: 'section' },
        { icon: <AiOutlineQuestionCircle />, label: 'AI 提问', value: 'itemize' },
        { icon: <AiOutlineTranslation />, label: 'AI 翻译', value: 'translate' },
        { icon: <AiOutlinePicture />, label: 'AI 生图', value: 'generate' },
    ];

    return (
        showDropdown && <div
            className="toolbar"
            style={{
                position: 'absolute',
                top: toolbarPosition.top,
                left: toolbarPosition.left,
                zIndex: 10,
                display: 'flex',
                gap: '5px',
            }}
        >
            <DropdownMenu options={options} onSelect={handleCommand} activeIndex={activeIndex} />
        </div>)
};

export default AiTools;
