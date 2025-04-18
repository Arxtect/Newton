// Mock lib0 functionality
const lib0 = {
  encoding: {
    toUint8Array: jest.fn().mockReturnValue(new Uint8Array()),
    fromUint8Array: jest.fn().mockReturnValue('')
  },
  decoding: {
    readVarUint: jest.fn().mockReturnValue(0),
    readVarString: jest.fn().mockReturnValue('')
  },
  map: {
    create: jest.fn().mockReturnValue({}),
    set: jest.fn(),
    get: jest.fn()
  },
  observable: {
    createObservable: jest.fn().mockReturnValue({
      on: jest.fn(),
      once: jest.fn(),
      off: jest.fn(),
      emit: jest.fn()
    })
  },
  time: {
    getUnixTime: jest.fn().mockReturnValue(Date.now())
  },
  random: {
    uint32: jest.fn().mockReturnValue(Math.floor(Math.random() * 1000))
  }
};

module.exports = lib0; 