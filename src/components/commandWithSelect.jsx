import React, { useState } from "react";
import { Button, Tooltip } from "@blueprintjs/core";

const CommandWithSelect = ({
  description,
  options,
  tooltip,
  validate,
  initialValue = "",
  onExec,
}) => {
  const [value, setValue] = useState(initialValue);

  return (
    <div>
      <span>{description}</span>
      &nbsp;
      <select value={value} onChange={(e) => setValue(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      &nbsp;
      <Tooltip content={tooltip ? tooltip(value) : undefined}>
        <Button
          text="exec"
          disabled={validate ? !validate(value) : false}
          onClick={() => onExec(value)}
        />
      </Tooltip>
    </div>
  );
};

export default CommandWithSelect;
