import React, { useState, useRef, useEffect } from 'react';
import { Icon } from "@blueprintjs/core";
import path from "path";
import useFileStore from '../../../domain/filesystem/fileReduces/fileActions'

const AddFile = ({ parentDir }) => {

    const { createFile, createDirectory, finishFileCreating, cancelFileCreating } = useFileStore((state) => ({
        createFile: state.createFile,
        createDirectory: state.createDirectory,
        finishFileCreating: state.finishFileCreating,
        cancelFileCreating: state.cancelFileCreating
    }));

    const [value, setValue] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, []);

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    const handleBlur = () => {
        cancelFileCreating();
    };

    const handleKeyDown = (ev) => {
        if (ev.keyCode === 27) { // Escape key
            cancelFileCreating();
        } else if (ev.keyCode === 13) { // Enter key
            const filepath = path.join(parentDir, value);
            finishFileCreating({ filepath });
        }
    };

    return (
        <div className="inline-block flex">
            <Icon icon="document" />
            <input
                className="tailwind-classes-for-input"
                ref={inputRef}
                value={value}
                onChange={handleChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
            />
        </div>
    );
};

export default AddFile;
