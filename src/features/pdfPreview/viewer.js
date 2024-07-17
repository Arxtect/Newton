import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

const ReactPDFViewer = ({ url }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Worker workerUrl="pdf.worker.min.mjs">
        <Viewer fileUrl={url} plugins={[defaultLayoutPluginInstance]} />
      </Worker>
    </div>
  );
};

export default ReactPDFViewer;
