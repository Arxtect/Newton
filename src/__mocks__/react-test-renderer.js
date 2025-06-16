// 模拟 react-test-renderer
const renderer = jest.fn().mockImplementation(() => ({
  toJSON: jest.fn().mockReturnValue({}),
  unmount: jest.fn(),
  root: {
    findAllByType: jest.fn().mockReturnValue([]),
    findByType: jest.fn().mockReturnValue({}),
    children: []
  }
}));

// 添加 act 函数
renderer.act = jest.fn(callback => callback());

// 导出模拟模块
module.exports = renderer; 