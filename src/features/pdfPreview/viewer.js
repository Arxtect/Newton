import React from "react";

const ReactPDFViewer = ({ url }) => {
  return (
    <embed
      src={url}
      type="application/pdf"
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default ReactPDFViewer;
