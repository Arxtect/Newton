// 模拟 y-protocols
const awarenessProtocol = {
    Awareness: jest.fn().mockImplementation(() => ({
      setLocalState: jest.fn(),
      getLocalState: jest.fn().mockReturnValue({}),
      on: jest.fn(),
      off: jest.fn()
    }))
  };
  
  const syncProtocol = {
    readSyncMessage: jest.fn(),
    writeSyncStep1: jest.fn().mockReturnValue(new Uint8Array()),
    writeSyncStep2: jest.fn().mockReturnValue(new Uint8Array()),
    writeUpdate: jest.fn().mockReturnValue(new Uint8Array())
  };
  
  module.exports = {
    awareness: awarenessProtocol,
    sync: syncProtocol
  };