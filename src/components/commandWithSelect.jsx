import React, { useState } from "react";
import { Button, MenuItem, Select, Tooltip } from "@mui/material";

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
    <div className="my-2">
      <span>{description}</span>
      &nbsp;
      <Select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="text-xs p-0 overflow-hidden mx-[8px]"
        size="small"
      >
        {options.map((o) => (
          <MenuItem key={o} value={o}>
            {o}
          </MenuItem>
        ))}
      </Select>
      <Tooltip title={tooltip ? tooltip(value) : undefined}>
        <Button
          variant="outlined"
          disabled={validate ? !validate(value) : false}
          onClick={() => onExec(value)}
        >
          exec
        </Button>
      </Tooltip>
    </div>
  );
};

export default CommandWithSelect;
