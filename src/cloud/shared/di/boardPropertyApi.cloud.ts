/* eslint-disable no-console -- Cloud board-property diagnostics */

import {
  boardPropertyKeyToWriteOnCloud,
  boardPropertyKeysToReadOnCloud,
  shouldCopyWipLimitsToV2,
} from '../../../infrastructure/jira/boardPropertyKeys';

function unwrapValueWrapper<T>(api: unknown): T {
  if (typeof api === 'object' && api !== null && 'value' in api) {
    console.log('[CloudAdapter:getBoardProperty] unwrapping value wrapper');
    return (api as { value: T }).value;
  }
  return api as T;
}

/** Board properties always come from the Jira API — no localStorage. */
export async function getBoardPropertyFromApi<T>(options: {
  property: string;
  fetchFromApi: () => Promise<unknown | null>;
}): Promise<T | undefined> {
  const { property, fetchFromApi } = options;
  console.log(`[CloudAdapter:getBoardProperty] property="${property}"`);

  const api = await fetchFromApi();
  console.log('[CloudAdapter:getBoardProperty] storage.get returned:', api === null ? 'null' : typeof api);

  if (api === null || api === undefined) {
    console.log('[CloudAdapter:getBoardProperty] returning: undefined');
    return undefined;
  }

  const unwrapped = unwrapValueWrapper<T>(api);
  console.log('[CloudAdapter:getBoardProperty] returning:', JSON.stringify(unwrapped).substring(0, 100));
  return unwrapped;
}

export async function loadCloudBoardProperty<T>(options: {
  property: string;
  get: (key: string) => Promise<unknown | null>;
  set: (key: string, value: unknown) => Promise<unknown>;
}): Promise<T | undefined> {
  const { property, get, set } = options;

  for (const key of boardPropertyKeysToReadOnCloud(property)) {
    const api = await get(key);
    if (api === null || api === undefined) {
      continue;
    }

    const value = unwrapValueWrapper<T>(api);
    if (shouldCopyWipLimitsToV2(property, key, value)) {
      await set(boardPropertyKeyToWriteOnCloud(property), value);
    }

    return getBoardPropertyFromApi<T>({
      property,
      fetchFromApi: async () => api,
    });
  }

  return getBoardPropertyFromApi<T>({
    property,
    fetchFromApi: async () => null,
  });
}
