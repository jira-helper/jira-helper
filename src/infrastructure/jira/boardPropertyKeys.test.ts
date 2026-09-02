import { describe, expect, it } from 'vitest';

import { BOARD_PROPERTIES } from 'src/shared/constants';
import {
  boardPropertyKeyToWrite,
  boardPropertyKeyToWriteOnCloud,
  boardPropertyKeyV1,
  boardPropertyKeyV2,
  boardPropertyKeysToRead,
  boardPropertyKeysToReadOnCloud,
  selectBoardPropertyKey,
  shouldCopyWipLimitsToV2,
} from './boardPropertyKeys';

describe('boardPropertyKeys', () => {
  it('reads column WIP from v2 first, then Server v1, then unsuffixed Cloud key', () => {
    expect(boardPropertyKeysToRead(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS)).toEqual([
      'subgroupsJHv2',
      'subgroupsJHv1',
      'subgroupsJH',
    ]);
  });

  it('writes column WIP only to v2 so 3.0.0 cannot overwrite it', () => {
    expect(boardPropertyKeyToWrite(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS)).toBe('subgroupsJHv2');
  });

  it('keeps other Server properties on the v1 key', () => {
    expect(boardPropertyKeysToRead(BOARD_PROPERTIES.PERSON_LIMITS)).toEqual(['personLimitsSettingsv1']);
    expect(boardPropertyKeyToWrite(BOARD_PROPERTIES.PERSON_LIMITS)).toBe('personLimitsSettingsv1');
  });

  it('keeps other Cloud properties on the unsuffixed key', () => {
    expect(boardPropertyKeysToReadOnCloud(BOARD_PROPERTIES.PERSON_LIMITS)).toEqual(['personLimitsSettings']);
    expect(boardPropertyKeyToWriteOnCloud(BOARD_PROPERTIES.PERSON_LIMITS)).toBe('personLimitsSettings');
  });

  it('writes Cloud column WIP only to v2', () => {
    expect(boardPropertyKeyToWriteOnCloud(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS)).toBe('subgroupsJHv2');
    expect(boardPropertyKeysToReadOnCloud(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS)).toEqual([
      'subgroupsJHv2',
      'subgroupsJHv1',
      'subgroupsJH',
    ]);
  });

  it('selects v2 when both column WIP keys exist', () => {
    expect(selectBoardPropertyKey(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS, ['subgroupsJHv1', 'subgroupsJHv2'])).toBe(
      'subgroupsJHv2'
    );
  });

  it('falls back to v1 when v2 is missing', () => {
    expect(selectBoardPropertyKey(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS, ['subgroupsJHv1'])).toBe('subgroupsJHv1');
  });

  it('copies non-empty v1 column WIP onto v2', () => {
    expect(
      shouldCopyWipLimitsToV2(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS, boardPropertyKeyV1('subgroupsJH'), {
        G1: { columns: ['115'], max: 5 },
      })
    ).toBe(true);
  });

  it('does not copy empty v1 (already wiped by 3.0.0) onto v2', () => {
    expect(shouldCopyWipLimitsToV2(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS, boardPropertyKeyV1('subgroupsJH'), {})).toBe(
      false
    );
  });

  it('copies non-empty unsuffixed Cloud column WIP onto v2', () => {
    expect(
      shouldCopyWipLimitsToV2(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS, 'subgroupsJH', {
        G1: { columns: ['115'], max: 5 },
      })
    ).toBe(true);
  });

  it('does not copy when the value already came from v2', () => {
    expect(
      shouldCopyWipLimitsToV2(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS, boardPropertyKeyV2('subgroupsJH'), {
        G1: { columns: ['115'] },
      })
    ).toBe(false);
  });
});
