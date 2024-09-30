/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-05-28 12:37:50
 */
import { useRef, useState, useEffect } from "react";
import { usePdfPreviewStore, useEngineStatusStore } from "store";
import * as constant from "@/constant";
import RotatingIcon from "./RotatingIconButton";
import { randomString } from "@/util";
import Tooltip from "@/components/tooltip";
import ArIcon from "@/components/arIcon";

export const EngineStatus = ({ className }) => {
  const { engineStatus, selectFormattedEngineStatus } = useEngineStatusStore();

  const { color, tooltip } = selectFormattedEngineStatus();

  useEffect(() => {
    console.log(color, tooltip, "selectFormattedEngineStatus");
  }, [color, tooltip]);

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <Tooltip content={tooltip} position="bottom">
        <div>
          {[constant.notReadyEngineStatus, constant.busyEngineStatus].includes(
            engineStatus
          ) ? (
            <RotatingIcon isRotating={true} />
          ) : engineStatus == constant.readyEngineStatus ? (
            <RotatingIcon isRotating={false} />
          ) : (
            <ArIcon
              name={
                // engineStatus == constant.readyEngineStatus
                //   ? "StatusSuccess"
                //   :
                engineStatus == constant.errorEngineStatus ? "Error" : ""
              }
              alt="engineStatus"
              className={`text-center ${color} hover:cursor-pointer h-4 `}
            />
          )}
        </div>
      </Tooltip>
    </div>
  );
};
