// Mock Chrome Extension API for Vitest browser mode
if (typeof globalThis.chrome === 'undefined') {
  const noop = () => {};
  const noopAsync = () => Promise.resolve();

  (globalThis as any).chrome = {
    runtime: {
      getURL: (path: string) => path,
      sendMessage: noopAsync,
      onMessage: { addListener: noop, removeListener: noop },
      id: 'mock-extension-id',
    },
    storage: {
      local: { get: noopAsync, set: noopAsync },
      sync: { get: noopAsync, set: noopAsync },
    },
    contextMenus: {
      create: noop,
      update: noop,
      remove: noop,
    },
  };
}
