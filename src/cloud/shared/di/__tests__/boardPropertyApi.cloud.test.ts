import { describe, expect, it } from 'vitest';

import { getBoardPropertyFromApi } from '../boardPropertyApi.cloud';

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
