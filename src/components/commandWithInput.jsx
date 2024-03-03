import React, { useState } from "react";
import { Button, TextField } from "@mui/material";

const CommandWithInput = ({
  description,
  placeholder,
  validate,
  initialValue = "",
  onExec,
}) => {
  const [value, setValue] = useState(initialValue);

  const handleExec = () => {
    onExec(value);
    setValue("");
  };

  return (
    <div className="my-2">
      <span>{description}</span>
      &nbsp;
      <TextField
        size="small"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
      &nbsp;
      <Button
        variant="contained"
        size="small"
        disabled={validate ? !validate(value) : false}
        onClick={handleExec}
      >
        exec
      </Button>
    </div>
  );
};

export default CommandWithInput;
