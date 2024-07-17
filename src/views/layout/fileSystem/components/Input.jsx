import React, { useState, useRef, useEffect } from 'react';

const Input = ({ initialValue, focus, onConfirm, onCancel }) => {
    const [value, setValue] = useState(initialValue);
    const inputRef = useRef(null);

    useEffect(() => {
        if (focus) {
            inputRef.current.focus();
        }
    }, [focus]);

    const handleBlur = () => {
        onCancel();
    };

    const handleChange = (ev) => {
        setValue(ev.target.value);
    };

    const handleKeyDown = async (ev) => {
        if (ev.key === 'Enter') {
            onConfirm(value);
        }

        if (ev.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <input
            ref={inputRef}
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:border-blue-300"
            value={value}
            onBlur={handleBlur}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
        />
    );
};

export default Input;
