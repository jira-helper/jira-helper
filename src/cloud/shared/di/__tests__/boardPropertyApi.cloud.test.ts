import { describe, expect, it, vi } from 'vitest';

import { BOARD_PROPERTIES } from 'src/shared/constants';
import { getBoardPropertyFromApi, loadCloudBoardProperty } from '../boardPropertyApi.cloud';

describe('getBoardPropertyFromApi', () => {
  it('returns API payload as-is', async () => {
    const result = await getBoardPropertyFromApi({
      property: 'personLimitsSettings',
      fetchFromApi: async () => ({
        limits: [
          {
            id: 2,
            limit: 3,
            persons: [{ name: 'maxim', displayName: 'Maxim' }],
            includedIssueTypes: ['Эпик'],
          },
        ],
      }),
    });

    expect(result).toEqual({
      limits: [
        {
          id: 2,
          limit: 3,
          persons: [{ name: 'maxim', displayName: 'Maxim' }],
          includedIssueTypes: ['Эпик'],
        },
      ],
    });
  });

  it('returns undefined when API has no property', async () => {
    const result = await getBoardPropertyFromApi({
      property: 'personLimitsSettings',
      fetchFromApi: async () => null,
    });

    expect(result).toBeUndefined();
  });

  it('unwraps nested value wrapper from API', async () => {
    const result = await getBoardPropertyFromApi({
      property: 'personLimitsSettings',
      fetchFromApi: async () => ({ value: { limits: [] } }),
    });

    expect(result).toEqual({ limits: [] });
  });
});

describe('loadCloudBoardProperty', () => {
  const leftover = { G1: { columns: ['115'], max: 5 } };

  it('prefers subgroupsJHv2 over leftover Cloud subgroupsJH', async () => {
    const get = vi.fn(async (key: string) => {
      if (key === 'subgroupsJHv2') return { G2: { columns: ['200'] } };
      if (key === 'subgroupsJH') return leftover;
      return null;
    });
    const set = vi.fn();

    const result = await loadCloudBoardProperty({
      property: BOARD_PROPERTIES.WIP_LIMITS_SETTINGS,
      get,
      set,
    });

    expect(result).toEqual({ G2: { columns: ['200'] } });
    expect(set).not.toHaveBeenCalled();
  });

  it('copies leftover unsuffixed Cloud WIP onto v2', async () => {
    const get = vi.fn(async (key: string) => (key === 'subgroupsJH' ? leftover : null));
    const set = vi.fn();

    const result = await loadCloudBoardProperty({
      property: BOARD_PROPERTIES.WIP_LIMITS_SETTINGS,
      get,
      set,
    });

    expect(result).toEqual(leftover);
    expect(set).toHaveBeenCalledWith('subgroupsJHv2', leftover);
  });

  it('does not copy empty leftover Cloud WIP onto v2', async () => {
    const get = vi.fn(async (key: string) => (key === 'subgroupsJH' ? {} : null));
    const set = vi.fn();

    const result = await loadCloudBoardProperty({
      property: BOARD_PROPERTIES.WIP_LIMITS_SETTINGS,
      get,
      set,
    });

    expect(result).toEqual({});
    expect(set).not.toHaveBeenCalled();
  });

  it('reads person limits from the unsuffixed Cloud key', async () => {
    const get = vi.fn(async (key: string) => (key === 'personLimitsSettings' ? { limits: [] } : null));
    const set = vi.fn();

    const result = await loadCloudBoardProperty({
      property: BOARD_PROPERTIES.PERSON_LIMITS,
      get,
      set,
    });

    expect(result).toEqual({ limits: [] });
    expect(get).toHaveBeenCalledWith('personLimitsSettings');
    expect(set).not.toHaveBeenCalled();
  });
});
