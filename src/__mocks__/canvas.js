// 模拟 Canvas API 和相关功能
class Canvas {
  constructor() {
    this.width = 0;
    this.height = 0;
  }

  getContext() {
    return {
      fillRect: jest.fn(),
      clearRect: jest.fn(),
      getImageData: jest.fn(() => ({ data: new Uint8ClampedArray(0) })),
      putImageData: jest.fn(),
      createImageData: jest.fn(() => ({ data: new Uint8ClampedArray(0) })),
      scale: jest.fn(),
      measureText: jest.fn(() => ({ width: 0 })),
      drawImage: jest.fn(),
      createPattern: jest.fn(),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
      })),
      fillText: jest.fn(),
      arc: jest.fn(),
      stroke: jest.fn(),
      fill: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      bezierCurveTo: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
    };
  }

  toDataURL() {
    return '';
  }

  toBlob(cb) {
    cb(null);
  }
}

// 模拟绘图上下文
const Context = {};

// 模拟节点 canvas
const createCanvas = jest.fn(() => new Canvas());

// 导出
module.exports = {
  Canvas,
  Context,
  createCanvas,
  __esModule: true,
}; 