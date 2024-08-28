import React from "react";

const ButtonGroup = ({ children,className }) => {
  return (
    <div
      className={`inline-flex rounded-md shadow-sm  ${className}`}
      role="group"
    >
      {React.Children.map(children, (child, index) =>{
          return (
            <React.Fragment key={index}>
              {index > 0 && <div className="border-l border-[#1b222c29]"></div>}
              {React.cloneElement(child, {
                className: `${child.props.className || ""}`,
                key: index,
              })}
            </React.Fragment>
          );
      }
       
      )}
    </div>
  );
};

export default ButtonGroup;
