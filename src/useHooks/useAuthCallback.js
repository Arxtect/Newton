import { useCallback } from "react";
import { toast } from "react-toastify";
import { useUserStore, useLoginStore } from "@/store";

export const useAuthCallback = () => {
  const { accessToken } = useUserStore((state) => ({
    accessToken: state.accessToken,
  }));

  const { updateDialogLoginOpen, updateOtherOperation } = useLoginStore(
    (state) => ({
      updateDialogLoginOpen: state.updateDialogLoginOpen,
      updateOtherOperation: state.updateOtherOperation,
    })
  );

  const executeCallback = useCallback(
    (callback, message = "Please login first") => {
      if (!accessToken) {
        toast.warn(message);
        updateDialogLoginOpen(true);
        updateOtherOperation(callback);
      } else {
        callback();
      }
    },
    [accessToken, updateDialogLoginOpen, updateOtherOperation]
  );

  return executeCallback;
};
