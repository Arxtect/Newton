import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ReactTooltip from "react-tooltip";
import { useEffect } from "react";
import { usePdfPreviewStore, useEngineStatusStore } from "store";
import { CircularProgress } from "@mui/material";
import ErrorSvg from "@/assets/website/error.svg";
import SuccessSvg from "@/assets/layout/success.svg";

export const EngineStatus = ({ className }) => {
  const { engineStatus, selectFormattedEngineStatus } = useEngineStatusStore();

  const [showTooltip, setShowTooltip] = useState(true);
  const { color, tooltip } = selectFormattedEngineStatus();
  const { toggleCompilerLog, setShowCompilerLog } = usePdfPreviewStore(
    (state) => ({
      toggleCompilerLog: state.toggleCompilerLog,
      setShowCompilerLog: state.setShowCompilerLog,
    })
  );

  useEffect(() => {
    if (engineStatus === 4) {
      setShowCompilerLog(true);
    }
  }, [engineStatus]);

  const handleClick = () => {
    if (engineStatus === 2) {
      toggleCompilerLog();
    }
  };

  useEffect(() => {
    ReactTooltip.rebuild();
  }, []);

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <a data-tip={tooltip} data-for="engineStatus">
        {engineStatus == 1 || engineStatus == 3 ? (
          <CircularProgress
            size={20}
            engineStatus={engineStatus}
            className={`text-center ${color} hover:cursor-pointer text-arxTheme h-4 w-4 flex justify-center items-center`}
            onClick={handleClick}
          />
        ) : (
          <img
            src={
              engineStatus == 2 ? SuccessSvg : engineStatus == 4 ? ErrorSvg : ""
            }
            engineStatus={engineStatus}
            className={`text-center ${color} hover:cursor-pointer h-4 w-4`}
            onClick={handleClick}
          />
        )}
      </a>

      <ReactTooltip
        id="engineStatus"
        place="bottom"
        type="dark"
        effect="solid"
        html={true}
      />
    </div>
  );
};
