import React, { useState } from "react";
import { Button, Tooltip } from "@blueprintjs/core";

const CommandWithInput = ({
  description,
  placeholder,
  validate,
  initialValue = "",
  onExec,
}) => {
  const [value, setValue] = useState(initialValue);

  return (
    <div>
      <span>{description}</span>
      &nbsp;
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
      &nbsp;
      <Button
        text="exec"
        disabled={validate ? !validate(value) : false}
        onClick={() => {
          onExec(value);
          setValue("");
        }}
      />
    </div>
  );
};

export default CommandWithInput;
