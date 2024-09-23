const PdfPreViewer = ({ pdfUrl }) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        colorScheme: "light",
      }}
    >
      <iframe
        src={pdfUrl}
        type="application/pdf"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="pdf"
      />
    </div>
  );
};
export default PdfPreViewer;
