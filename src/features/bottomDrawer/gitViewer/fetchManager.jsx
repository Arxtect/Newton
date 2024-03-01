import React, { useState } from "react";
import * as git from "isomorphic-git";
import { toast } from "react-toastify";

const FetchManager = ({ projectRoot, remotes, corsProxy, token }) => {
  const [selectedRemote, setSelectedRemote] = useState(remotes[0] || "");

  const handleFetch = async () => {
    try {
      await git.fetch({
        dir: projectRoot,
        remote: selectedRemote,
        corsProxy,
        username: token, 
        password: token,
      });
      // TODO: show updated branch
      toast.success(`Fetch done: ${selectedRemote}`);
    } catch (e) {
      toast.error(`Fetch failed: ${selectedRemote}`);
    }
  };

  return (
    <div>
      {remotes.length > 0 && (
        <>
          Fetch from&nbsp;
          <select
            value={selectedRemote}
            onChange={(ev) => setSelectedRemote(ev.target.value)}
          >
            {remotes.map((remote) => (
              <option key={remote} value={remote}>
                {remote}
              </option>
            ))}
          </select>
          <button onClick={handleFetch}>exec</button>
        </>
      )}
    </div>
  );
};

export default FetchManager;
