import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

export function createMockEnvironment(initialStorage = new Map()) {
  const storage = initialStorage;
  const mockLocalStorage = {
    getItem: (k) => storage.has(k) ? storage.get(k) : null,
    setItem: (k, v) => storage.set(k, String(v)),
    removeItem: (k) => storage.delete(k),
    clear: () => storage.clear(),
    _storage: storage
  };

  const mockDoc = {
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: () => ({ setAttribute: () => {}, appendChild: () => {}, style: {} }),
    documentElement: { setAttribute: () => {}, classList: { add: () => {}, remove: () => {}, contains: () => false } },
    body: { classList: { add: () => {}, remove: () => {}, contains: () => false }, appendChild: () => {} }
  };

  const cloudTopupsStore = [];

  const mockWindow = {
    localStorage: mockLocalStorage,
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { origin: 'http://localhost:3000', href: 'http://localhost:3000' },
    document: mockDoc,
    navigator: { userAgent: 'node-test' },
    BroadcastChannel: class {
      constructor(name) { this.name = name; }
      postMessage() {}
      close() {}
      addEventListener() {}
    },
    btoa: (str) => Buffer.from(str).toString('base64'),
    atob: (b64) => Buffer.from(b64, 'base64').toString('utf8'),
    ShopVietFirebase: {
      fetchUserFromCloud: async () => null,
      fetchTopupsFromCloud: async () => [...cloudTopupsStore],
      syncTopupToCloud: async () => true,
      syncOrderToCloud: async () => true,
      getIdToken: async () => null
    },
    BuiThaiNtfy: {
      playChime: () => {}
    },
    // Helper to control mock cloud topups during test
    setCloudTopups: (list) => {
      cloudTopupsStore.length = 0;
      if (Array.isArray(list)) cloudTopupsStore.push(...list);
    }
  };
  mockWindow.window = mockWindow;

  return { mockWindow, mockDoc, mockLocalStorage, storage };
}

export function loadStateInstance(stateJsPath, mockEnv) {
  const code = fs.readFileSync(stateJsPath, 'utf8');
  const fakeSetInterval = () => 999;
  const fakeClearInterval = () => {};

  const context = vm.createContext({
    ...globalThis,
    window: mockEnv.mockWindow,
    document: mockEnv.mockDoc,
    localStorage: mockEnv.mockLocalStorage,
    location: mockEnv.mockWindow.location,
    navigator: mockEnv.mockWindow.navigator,
    BroadcastChannel: mockEnv.mockWindow.BroadcastChannel,
    setInterval: fakeSetInterval,
    clearInterval: fakeClearInterval,
    setTimeout: globalThis.setTimeout,
    clearTimeout: globalThis.clearTimeout,
    fetch: async () => ({ ok: false, json: async () => null }),
    console: {
      ...console,
      log: () => {},
      warn: () => {},
      error: console.error
    }
  });

  vm.runInContext(code, context);
  return mockEnv.mockWindow.ShopVietState;
}
