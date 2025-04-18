// 模拟 react-pdf 组件和功能
const ReactPDF = {
  pdfjs: {
    GlobalWorkerOptions: {
      workerSrc: ''
    }
  },
  Document: jest.fn().mockImplementation(({ children }) => children),
  Page: jest.fn().mockImplementation(() => null),
  Outline: jest.fn().mockImplementation(() => null),
  PDFDownloadLink: jest.fn().mockImplementation(() => null)
};

// 导出所有模拟组件
module.exports = {
  pdfjs: ReactPDF.pdfjs,
  Document: ReactPDF.Document,
  Page: ReactPDF.Page,
  Outline: ReactPDF.Outline,
  PDFDownloadLink: ReactPDF.PDFDownloadLink,
  __esModule: true
}; 