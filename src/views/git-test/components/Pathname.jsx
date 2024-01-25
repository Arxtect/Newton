import React from 'react';

const Pathname = ({ ignoreGit, children }) => {
    const style = {
        color: ignoreGit ? "#aaa" : "inherit",
        // Add more styles or Tailwind classes as needed
    };

    return <span style={style}>{children}</span>;
};

export default Pathname;
