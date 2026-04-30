import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Ok } from 'ts-results';
import { LocalStorageService } from './LocalStorageService';

function createMemoryStorage(): Storage {
  const map = new Map<string, string>();
  return {
    get length() {
      return map.size;
    },
    clear() {
      map.clear();
    },
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    removeItem(key: string) {
      map.delete(key);
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
  } as unknown as Storage;
}

describe('LocalStorageService', () => {
  describe('with in-memory storage (success paths)', () => {
    let memory: Storage;
    let service: LocalStorageService;

    beforeEach(() => {
      memory = createMemoryStorage();
      memory.setItem('preseed', 'x');
      service = new LocalStorageService(memory);
    });

    it('getItem returns Ok(value) when key exists', () => {
      const result = service.getItem('preseed');
      expect(result).toEqual(Ok('x'));
    });

    it('getItem returns Ok(null) when key is missing', () => {
      const result = service.getItem('missing');
      expect(result).toEqual(Ok(null));
    });

    it('setItem persists and getItem reads back', () => {
      expect(service.setItem('k', 'v').ok).toBe(true);
      expect(service.getItem('k')).toEqual(Ok('v'));
    });

    it('removeItem clears key', () => {
      expect(service.removeItem('preseed').ok).toBe(true);
      expect(service.getItem('preseed')).toEqual(Ok(null));
    });
  });

  describe('with global localStorage (success paths)', () => {
    let service: LocalStorageService;

    beforeEach(() => {
      localStorage.clear();
      service = new LocalStorageService();
    });

    it('integrates with browser localStorage', () => {
      expect(service.setItem('a', 'b').ok).toBe(true);
      expect(service.getItem('a')).toEqual(Ok('b'));
      expect(service.removeItem('a').ok).toBe(true);
      expect(service.getItem('a')).toEqual(Ok(null));
    });

    it('resolves globalThis.localStorage when each method runs if no Storage was injected', () => {
      const memoryFirst = createMemoryStorage();
      const memorySecond = createMemoryStorage();

      vi.stubGlobal('localStorage', memoryFirst);
      try {
        const serviceNoInject = new LocalStorageService();

        expect(serviceNoInject.setItem('k', 'v').ok).toBe(true);
        expect(memoryFirst.getItem('k')).toBe('v');

        vi.stubGlobal('localStorage', memorySecond);
        expect(serviceNoInject.getItem('k')).toEqual(Ok(null));
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });

  describe('exception paths', () => {
    it('getItem returns Err when storage throws', () => {
      const storage = {
        getItem: () => {
          throw new Error('read blocked');
        },
        setItem: () => {},
        removeItem: () => {},
      } as unknown as Storage;

      const service = new LocalStorageService(storage);
      const result = service.getItem('any');

      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toBe('read blocked');
    });

    it('setItem returns Err when storage throws', () => {
      const storage = {
        getItem: () => null,
        setItem: () => {
          throw new Error('quota');
        },
        removeItem: () => {},
      } as unknown as Storage;

      const service = new LocalStorageService(storage);
      const result = service.setItem('k', 'v');

      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toBe('quota');
    });

    it('removeItem returns Err when storage throws', () => {
      const storage = {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {
          throw new Error('remove failed');
        },
      } as unknown as Storage;

      const service = new LocalStorageService(storage);
      const result = service.removeItem('k');

      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toBe('remove failed');
    });

    it('non-Error throws are wrapped in Error', () => {
      const storage = {
        getItem: () => {
          throw 'string-throw';
        },
        setItem: () => {},
        removeItem: () => {},
      } as unknown as Storage;

      const service = new LocalStorageService(storage);
      const result = service.getItem('k');

      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect((result.val as Error).message).toBe('string-throw');
    });
  });
});
