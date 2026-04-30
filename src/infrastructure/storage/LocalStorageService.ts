import { Err, Ok, Result } from 'ts-results';

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

/**
 * Generic browser storage access; returns Result instead of throwing.
 */
export interface ILocalStorageService {
  /** Reads a value; missing key yields `Ok(null)`. */
  getItem(key: string): Result<string | null, Error>;
  setItem(key: string, value: string): Result<void, Error>;
  removeItem(key: string): Result<void, Error>;
}

/**
 * Wraps {@link Storage} (typically `globalThis.localStorage`); maps exceptions to `Err`.
 *
 * When constructed without an explicit {@link Storage}, resolves `globalThis.localStorage`
 * **on each call** so callers always use the runtime page `Storage` API (Chrome content scripts
 * run in Jira page context — binding at construction time offers no gain and risks stale mocks).
 */
export class LocalStorageService implements ILocalStorageService {
  constructor(private readonly storage?: Storage) {}

  private backing(): Storage {
    return this.storage ?? globalThis.localStorage;
  }

  getItem(key: string): Result<string | null, Error> {
    try {
      return Ok(this.backing().getItem(key));
    } catch (e) {
      return Err(toError(e));
    }
  }

  setItem(key: string, value: string): Result<void, Error> {
    try {
      this.backing().setItem(key, value);
      return Ok(undefined);
    } catch (e) {
      return Err(toError(e));
    }
  }

  removeItem(key: string): Result<void, Error> {
    try {
      this.backing().removeItem(key);
      return Ok(undefined);
    } catch (e) {
      return Err(toError(e));
    }
  }
}
