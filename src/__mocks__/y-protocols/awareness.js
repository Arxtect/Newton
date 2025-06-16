// 模拟 y-protocols/awareness 模块

/**
 * 模拟 Awareness 类，用于协作编辑中的用户状态感知
 */
class Awareness {
  constructor(doc) {
    this.doc = doc;
    this.states = new Map();
    this.meta = new Map();
    this.localState = null;
  }

  // 设置本地用户状态
  setLocalState(state) {
    this.localState = state;
    if (state !== null) {
      this.states.set(0, state); // 0作为本地用户ID
    } else {
      this.states.delete(0);
    }
    return this;
  }

  // 获取本地用户状态
  getLocalState() {
    return this.localState;
  }

  // 获取所有客户端状态
  getStates() {
    return this.states;
  }

  // 事件监听和移除
  on(eventName, callback) {
    // 模拟事件监听
    return this;
  }

  off(eventName, callback) {
    // 模拟事件移除
    return this;
  }

  // 清理本地状态
  destroy() {
    this.localState = null;
    this.states.clear();
  }

  // 模拟状态更新传播
  setStates(states) {
    for (const [client, state] of states) {
      this.states.set(client, state);
    }
  }
}

// 创建模拟函数
const createAwarenessUpdateMock = jest.fn(() => new Uint8Array());
const encodeAwarenessUpdateMock = jest.fn(() => new Uint8Array());
const applyAwarenessUpdateMock = jest.fn();
const removeAwarenessStatesMock = jest.fn();

// 导出模拟的方法和类
module.exports = {
  Awareness,
  createAwarenessUpdate: createAwarenessUpdateMock,
  encodeAwarenessUpdate: encodeAwarenessUpdateMock,
  applyAwarenessUpdate: applyAwarenessUpdateMock,
  removeAwarenessStates: removeAwarenessStatesMock
};
