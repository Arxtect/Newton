/*
 * @Description: 
 * @Author: Devin
 * @Date: 2024-05-28 12:37:50
 */
import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { useEffect } from "react";
import { usePdfPreviewStore, useEngineStatusStore } from "store";
import { CircularProgress } from "@mui/material";
import ErrorSvg from "@/assets/website/error.svg";
import SuccessSvg from "@/assets/layout/success.svg";
import * as constant from "@/constant";
import RotatingIcon from "./RotatingIconButton";
import { randomString } from "@/util";
import Tooltip from "@/components/tooltip";

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

  const handleClick = () => {
    if (engineStatus === constant.readyEngineStatus) {
      toggleCompilerLog();
    }
  };

  // useEffect(() => {
  //   ReactTooltip.rebuild();
  // }, []);
  const selector = useRef(`status-tooltip-${randomString(4)}`);


  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Tooltip selector={selector.current} content={tooltip} position="bottom">
        {[constant.notReadyEngineStatus, constant.busyEngineStatus].includes(
          engineStatus
        ) ? (
          <div>
            <RotatingIcon isRotating={true} />
          </div>
        ) : (
          <img
            src={
              engineStatus == constant.readyEngineStatus
                ? SuccessSvg
                : engineStatus == constant.errorEngineStatus
                ? ErrorSvg
                : ""
            }
            alt="engineStatus"
            engineStatus={engineStatus}
            className={`text-center ${color} hover:cursor-pointer h-4 w-4`}
            // onClick={handleClick}
          />
        )}
      </Tooltip>
    </div>
  );
};
