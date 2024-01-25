import React, { useState, useRef, useEffect } from 'react';
import { Icon } from "@blueprintjs/core";
import path from "path";

const AddFile = ({ parentDir, createFile, createDirectory, finishFileCreating, cancelFileCreating }) => {
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
        cancelFileCreating({});
    };

    const handleKeyDown = (ev) => {
        if (ev.keyCode === 27) { // Escape key
            cancelFileCreating({});
        } else if (ev.keyCode === 13) { // Enter key
            const filepath = path.join(parentDir, value);
            finishFileCreating({ filepath });
        }
    };

    return (
        <div className="inline-block">
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
