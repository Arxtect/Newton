/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-02-03 14:40:10
 */
import create from "zustand";
import * as constant from "@/constant";

export const useEngineStatusStore = create((set) => ({
  engineStatus: 1,
  isTriggerCompile: false,
  setIsTriggerCompile: (isTriggerCompile) =>
    set(() => ({ isTriggerCompile: isTriggerCompile })),
  setCustomEngineStatus: (engineStatus) => set(() => ({ engineStatus })),
  setNotReadyEngineStatus: () =>
    set(() => ({ engineStatus: constant.notReadyEngineStatus })),
  setReadyEngineStatus: () =>
    set(() => ({ engineStatus: constant.readyEngineStatus })),
  setBusyEngineStatus: () =>
    set(() => ({ engineStatus: constant.busyEngineStatus })),
  setErrorEngineStatus: () =>
    set(() => ({ engineStatus: constant.errorEngineStatus })),
  selectFormattedEngineStatus: () => {
    const { engineStatus } = useEngineStatusStore.getState();
    console.log(engineStatus, "engineStatus");
    switch (engineStatus) {
      case 1:
        return {
          color: "text-arxTheme",
          tooltip: "Initializing LaTeX Engine...",
        };
      case 2:
        return {
          color: "text-black",
          tooltip: "LaTeX Engine Ready for Use! ",
        };
      case 3:
        return {
          color: "text-arxTheme",
          tooltip: "LaTeX Engine Busy Compiling...",
        };
      case 4:
        return {
          color: "text-red-500",
          tooltip: "Error with LaTeX Engine!",
        };
      default:
        return null;
    }
  },
}));

export const {
  setCustomEngineStatus,
  setNotReadyEngineStatus,
  setReadyEngineStatus,
  setBusyEngineStatus,
  setErrorEngineStatus,
} = useEngineStatusStore.getState();

// 导出选择器函数
export const selectFormattedEngineStatus = () => {
  const { engineStatus } = useEngineStatusStore.getState();
  return useEngineStatusStore
    .getState()
    .selectFormattedEngineStatus(engineStatus);
};
