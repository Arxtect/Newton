// 模拟 pdfjs-dist 基本功能
const mockPdfJs = {
  GlobalWorkerOptions: {
    workerSrc: ''
  },
  getDocument: jest.fn().mockResolvedValue({
    promise: Promise.resolve({
      numPages: 5,
      getPage: jest.fn().mockResolvedValue({
        getViewport: jest.fn().mockReturnValue({
          width: 800,
          height: 1200
        }),
        render: jest.fn().mockResolvedValue({}),
        getTextContent: jest.fn().mockResolvedValue({
          items: []
        })
      })
    })
  })
};

// 导出模拟对象
module.exports = mockPdfJs; 