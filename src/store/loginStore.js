/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-02-03 14:40:10
 */
import create from "zustand";

export const useLoginStore = create((set) => ({
  dialogLoginOpen: false,
  otherOperation: null,
  updateDialogLoginOpen(dialogLoginOpen) {
    set((state) => ({ dialogLoginOpen: dialogLoginOpen }));
  },
  updateOtherOperation(otherOperation) {
    set((state) => ({ otherOperation: otherOperation }));
  },
}));

export const { updateDialogLoginOpen } = useLoginStore.getState();
