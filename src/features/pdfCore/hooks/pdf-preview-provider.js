/*
 * @Description:
 * @Author: Devin
 * @Date: 2024-09-30 16:49:00
 */
import { createContext, useContext, useMemo, useState } from "react";

const PdfPreviewContext = createContext(undefined);

export const usePdfPreviewContext = () => {
  const context = useContext(PdfPreviewContext);
  if (!context) {
    throw new Error(
      "usePdfPreviewContext is only available inside PdfPreviewProvider"
    );
  }
  return context;
};

export const PdfPreviewProvider = ({ children }) => {
  const [loadingError, setLoadingError] = useState(false);

  const value = useMemo(
    () => ({ loadingError, setLoadingError }),
    [loadingError]
  );

  return (
    <PdfPreviewContext.Provider value={value}>
      {children}
    </PdfPreviewContext.Provider>
  );
};
