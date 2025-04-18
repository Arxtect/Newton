// 模拟 lib0/mutex.js 模块
export const createMutex = jest.fn().mockImplementation(() => ({
  // lock 方法接受一个回调函数，执行它并返回一个 Promise
  lock: jest.fn((callback) => {
    if (callback) callback();
    return Promise.resolve();
  }),
  // unlock 方法是一个简单的模拟函数
  unlock: jest.fn()
}));

// 确保默认导出也可用
export default { createMutex };
