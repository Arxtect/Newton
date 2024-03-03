import React, { useState } from "react";
import * as git from "isomorphic-git";
import { toast } from "react-toastify";
import { Select, Button, MenuItem } from "@mui/material";
import fs from "fs";

const FetchManager = ({ projectRoot, remotes, corsProxy, token }) => {
  const [selectedRemote, setSelectedRemote] = useState(remotes[0] || "");

  const selectStyle = {
    marginRight: 1,
  };

  const buttonStyle = {
    fontSize: "small",
  };

  const handleFetch = async () => {
    try {
      await git.fetch({
        fs,
        dir: projectRoot,
        remote: selectedRemote,
        corsProxy,
        token,
      });
      // TODO: show updated branch
      toast.success(`Fetch done: ${selectedRemote}`);
    } catch (e) {
      toast.error(`Fetch failed: ${selectedRemote}`);
    }
  };

  return (
    <div className="my-2">
      {remotes.length > 0 && (
        <>
          Fetch from&nbsp;
          <Select
            labelId="simple-select-outlined-label"
            className="text-xs p-0 overflow-hidden mr-[8px]"
            size="small"
            value={selectedRemote}
            onChange={(ev) => setSelectedRemote(ev.target.value)}
            style={selectStyle}
          >
            {remotes.map((item, index) => {
              return (
                <MenuItem value={item} key={item}>
                  {item}
                </MenuItem>
              );
            })}
          </Select>
          <Button onClick={handleFetch} variant="outlined" style={buttonStyle}>
            exec
          </Button>
        </>
      )}
    </div>
  );
};

export default FetchManager;
