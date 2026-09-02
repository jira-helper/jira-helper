import { BOARD_PROPERTIES } from 'src/shared/constants';

const LEGACY_SUFFIX = 'v1';
/** 3.0.0 persist-on-apply wipes `subgroupsJHv1`. Newer builds read/write v2 so leftover 3.0.0 clients cannot clobber recovered limits. Remove the v1 fallback after 3.0.0 is gone from the field. */
const WIP_SAFE_SUFFIX = 'v2';

export function boardPropertyKeyV1(property: string): string {
  return `${property}${LEGACY_SUFFIX}`;
}

export function boardPropertyKeyV2(property: string): string {
  return `${property}${WIP_SAFE_SUFFIX}`;
}

export function boardPropertyKeysToRead(property: string): string[] {
  if (property === BOARD_PROPERTIES.WIP_LIMITS_SETTINGS) {
    return [boardPropertyKeyV2(property), boardPropertyKeyV1(property), property];
  }
  return [boardPropertyKeyV1(property)];
}

/** Cloud never stored the Server `v1` suffix except for this WIP workaround. */
export function boardPropertyKeysToReadOnCloud(property: string): string[] {
  if (property === BOARD_PROPERTIES.WIP_LIMITS_SETTINGS) {
    return boardPropertyKeysToRead(property);
  }
  return [property];
}

export function boardPropertyKeyToWrite(property: string): string {
  if (property === BOARD_PROPERTIES.WIP_LIMITS_SETTINGS) {
    return boardPropertyKeyV2(property);
  }
  return boardPropertyKeyV1(property);
}

export function boardPropertyKeyToWriteOnCloud(property: string): string {
  if (property === BOARD_PROPERTIES.WIP_LIMITS_SETTINGS) {
    return boardPropertyKeyV2(property);
  }
  return property;
}

export function selectBoardPropertyKey(property: string, existingKeys: Iterable<string>): string | undefined {
  const have = new Set(existingKeys);
  return boardPropertyKeysToRead(property).find(key => have.has(key));
}

export function isNonEmptyPropertyValue(value: unknown): boolean {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length > 0;
}

/** Copy leftover v1 / unsuffixed WIP into v2 so a still-installed 3.0.0 cannot wipe the only copy. */
export function shouldCopyWipLimitsToV2(property: string, selectedKey: string | undefined, value: unknown): boolean {
  return (
    property === BOARD_PROPERTIES.WIP_LIMITS_SETTINGS &&
    selectedKey != null &&
    selectedKey !== boardPropertyKeyV2(property) &&
    isNonEmptyPropertyValue(value)
  );
}
