/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 12:37:50
 */
import { useRef, useState } from "react";
import { usePdfPreviewStore, useEngineStatusStore } from "store";
import * as constant from "@/constant";
import RotatingIcon from "./RotatingIconButton";
import { randomString } from "@/util";
import Tooltip from "@/components/tooltip";
import ArIcon from "@/components/arIcon";

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
          <ArIcon
            name={
              engineStatus == constant.readyEngineStatus
                ? "StatusSuccess"
                : engineStatus == constant.errorEngineStatus
                ? "Error"
                : ""
            }
            alt="engineStatus"
            engineStatus={engineStatus}
            className={`text-center ${color} hover:cursor-pointer h-4 `}
          />
        )}
      </Tooltip>
    </div>
  );
};
