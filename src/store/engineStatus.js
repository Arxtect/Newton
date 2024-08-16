/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-02-03 14:40:10
 */
import create from "zustand";

export const useEngineStatusStore = create((set) => ({
  engineStatus: 1,
  setCustomEngineStatus: (engineStatus) => set(() => ({ engineStatus })),
  setNotReadyEngineStatus: () => set(() => ({ engineStatus: 1 })),
  setReadyEngineStatus: () => set(() => ({ engineStatus: 2 })),
  setBusyEngineStatus: () => set(() => ({ engineStatus: 3 })),
  setErrorEngineStatus: () => set(() => ({ engineStatus: 4 })),
  selectFormattedEngineStatus: () => {
    const { engineStatus } = useEngineStatusStore.getState();
    switch (engineStatus) {
      case 1:
        return {
          color: "text-arxTheme",
          tooltip: "Initializing LaTeX Engine...",
        };
      case 2:
        return {
          color: "text-green-500",
          tooltip:
            "LaTeX Engine Ready for Use! ",
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
