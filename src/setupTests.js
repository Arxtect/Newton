// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// 模拟 canvas
if (typeof window !== 'undefined') {
  // 模拟 window 相关对象
  window.matchMedia = window.matchMedia || function() {
    return {
      matches: false,
      addListener: function() {},
      removeListener: function() {}
    };
  };

  // 模拟 canvas API
  global.HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Array(4),
    })),
    putImageData: jest.fn(),
    createImageData: jest.fn(() => []),
    setTransform: jest.fn(),
    drawImage: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    scale: jest.fn(),
    rotate: jest.fn(),
    translate: jest.fn(),
    transform: jest.fn(),
    fillText: jest.fn(),
  }));
  
  global.HTMLCanvasElement.prototype.toDataURL = jest.fn(() => '');
}

// 模拟 PDF.js Worker
jest.mock('pdfjs-dist/build/pdf.worker.entry', () => {}, { virtual: true });

// 禁用某些控制台警告
console.error = jest.fn();
console.warn = jest.fn();
