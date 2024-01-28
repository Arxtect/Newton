import React, { useState, useRef, useEffect } from 'react';
import { Icon } from "@blueprintjs/core";
import path from "path";
import useFileStore from '../../../domain/filesystem/fileReduces/fileActions'



const AddDir = ({ parentDir }) => {
    const { createFile, createDirectory, finishDirCreating, cancelDirCreating } = useFileStore((state) => ({
        createFile: state.createFile,
        createDirectory: state.createDirectory,
        finishDirCreating: state.finishDirCreating,
        cancelDirCreating: state.cancelDirCreating
    }));
    const [value, setValue] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleInputChange = (event) => {
        setValue(event.target.value);
    };

    const handleInputBlur = () => {
        cancelDirCreating({}); // Assuming this is how your action is structured
    };

    const handleKeyDown = (ev) => {
        if (ev.keyCode === 27) { // Escape key
            cancelDirCreating({});
        }
        if (ev.keyCode === 13) { // Enter key
            const dirpath = path.join(parentDir, value);
            finishDirCreating({ dirpath });
        }
    };

    return (
        <div className="inline-block flex"> {/* Tailwind CSS class */}
            <Icon icon="folder-new" />
            <input
                className="your-tailwind-classes-here" // Add Tailwind CSS classes as needed
                ref={inputRef}
                value={value}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};

export default AddDir;
