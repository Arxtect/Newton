// Mock of basic YJS functionality
const Y = {
  Doc: jest.fn().mockImplementation(() => ({
    getText: jest.fn().mockReturnValue({
      toString: jest.fn().mockReturnValue(''),
      observe: jest.fn(),
      insert: jest.fn(),
      delete: jest.fn(),
      toJSON: jest.fn().mockReturnValue('')
    }),
    getMap: jest.fn().mockReturnValue({
      set: jest.fn(),
      get: jest.fn(),
      observe: jest.fn()
    }),
    getArray: jest.fn().mockReturnValue({
      insert: jest.fn(),
      delete: jest.fn(),
      push: jest.fn(),
      toArray: jest.fn().mockReturnValue([]),
      observe: jest.fn()
    }),
    on: jest.fn(),
    off: jest.fn(),
    share: {},
    destroy: jest.fn()
  })),
  Text: jest.fn().mockImplementation(() => ({
    toString: jest.fn().mockReturnValue(''),
    observe: jest.fn(),
    insert: jest.fn(),
    delete: jest.fn(),
    toJSON: jest.fn().mockReturnValue('')
  })),
  Map: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    get: jest.fn(),
    observe: jest.fn()
  })),
  Array: jest.fn().mockImplementation(() => ({
    insert: jest.fn(),
    delete: jest.fn(),
    push: jest.fn(),
    toArray: jest.fn().mockReturnValue([]),
    observe: jest.fn()
  })),
  UndoManager: jest.fn().mockImplementation(() => ({
    undo: jest.fn(),
    redo: jest.fn(),
    on: jest.fn()
  }))
};

module.exports = Y; 