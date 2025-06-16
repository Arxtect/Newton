// 模拟 y-websocket
const WebsocketProvider = jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    off: jest.fn(),
    connect: jest.fn(),
    disconnect: jest.fn(),
    awareness: {
      setLocalState: jest.fn(),
      getLocalState: jest.fn().mockReturnValue({}),
      on: jest.fn(),
      off: jest.fn()
    },
    shouldConnect: true,
    connected: false
  }));
  
  module.exports = {
    WebsocketProvider
  };