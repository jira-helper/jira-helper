/* eslint-disable no-console -- Cloud board-property diagnostics */

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
