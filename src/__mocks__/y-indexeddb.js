// 模拟 y-indexeddb
const IndexeddbPersistence = jest.fn().mockImplementation(() => ({
    bindState: jest.fn(),
    unbindState: jest.fn(),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    off: jest.fn(),
    destroy: jest.fn().mockResolvedValue(undefined)
  }));
  
  module.exports = {
    IndexeddbPersistence
  };