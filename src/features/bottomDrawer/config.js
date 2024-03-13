import React from "react";
import ArTextField from "@/components/arTextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useGitRepo } from "store";

export default function Config() {
  const {
    committerName,
    committerEmail,
    corsProxy,
    gitEasyMode,
    githubApiToken,
    changeConfig,
  } = useGitRepo((state) => ({
    committerName: state.committerName,
    committerEmail: state.committerEmail,
    corsProxy: state.corsProxy,
    gitEasyMode: state.gitEasyMode,
    githubApiToken: state.githubApiToken,
    changeConfig: state.changeConfig,
  }));

  return (
    <div className="mt-[-10px]">
      <div className=" w-[25%]">
        <ArTextField
          label="Git: Committer Name"
          variant="outlined"
          placeholder="Your committer name"
          defaultValue={committerName}
          onChange={(event) =>
            changeConfig({ committerName: event.target.value })
          }
          margin="normal"
          sx={{ width: "100%" }}
        />
      </div>
      <div className="w-[25%]">
        <ArTextField
          label="Git: Committer Email"
          variant="outlined"
          placeholder="Your email"
          defaultValue={committerEmail}
          onChange={(event) =>
            changeConfig({ committerEmail: event.target.value })
          }
          margin="normal"
          sx={{ width: "100%" }}
        />
      </div>

      <div className="w-[50%]">
        <ArTextField
          label="GitHub: Private Access Token"
          variant="outlined"
          defaultValue={githubApiToken}
          onChange={(event) =>
            changeConfig({ githubApiToken: event.target.value })
          }
          margin="normal"
          sx={{ width: "100%" }}
        />
      </div>
      <div className="mb-[10px] w-[50%]">
        <ArTextField
          label="GitHub: CORS Proxy"
          variant="outlined"
          defaultValue={corsProxy}
          onChange={(event) => changeConfig({ corsProxy: event.target.value })}
          margin="normal"
          sx={{ width: "100%" }}
        />
      </div>
      <div className="mb-[10px] w-[50%]">
        <Card variant="outlined">
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              CAUTION!!!: Setting token and using proxy are at your own risk. If
              we have vulnerability to access localStorage, it might be leak.
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
