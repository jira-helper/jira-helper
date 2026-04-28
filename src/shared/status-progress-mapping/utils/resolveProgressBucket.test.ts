import { describe, expect, it } from 'vitest';

import { resolveProgressBucket } from './resolveProgressBucket';
import type { StatusProgressMapping } from '../types';

describe('resolveProgressBucket', () => {
  it('uses custom mapping bucket when statusId matches the map key (wins over Jira category)', () => {
    const mapping: StatusProgressMapping = {
      '10001': {
        statusId: '10001',
        statusName: 'Ready for QA',
        bucket: 'done',
      },
    };

    expect(resolveProgressBucket('10001', 'new', mapping)).toBe('done');
    expect(resolveProgressBucket('10001', 'indeterminate', mapping)).toBe('done');
  });

  it('falls back to Jira statusCategory when mapping is missing', () => {
    expect(resolveProgressBucket('1', 'new', undefined)).toBe('todo');
    expect(resolveProgressBucket('1', 'new', null)).toBe('todo');
  });

  it('maps new -> todo, indeterminate -> inProgress, done -> done when mapping has no entry', () => {
    expect(resolveProgressBucket('x', 'new', {})).toBe('todo');
    expect(resolveProgressBucket('x', 'indeterminate', {})).toBe('inProgress');
    expect(resolveProgressBucket('x', 'done', {})).toBe('done');
  });

  it('does not match by statusName: same label different ids uses category fallback for unknown id', () => {
    const mapping: StatusProgressMapping = {
      '10': {
        statusId: '10',
        statusName: 'Shared Label',
        bucket: 'done',
      },
    };

    expect(resolveProgressBucket('20', 'new', mapping)).toBe('todo');
    expect(resolveProgressBucket('20', 'indeterminate', mapping)).toBe('inProgress');
  });

  it('ignores statusName on the matched entry (only id key selects the row)', () => {
    const mapping: StatusProgressMapping = {
      '99': {
        statusId: '99',
        statusName: 'Misleading name that could imply todo',
        bucket: 'inProgress',
      },
    };

    expect(resolveProgressBucket('99', 'new', mapping)).toBe('inProgress');
  });

  it('uses conservative done fallback for unknown statusCategory keys (matches sub-tasks default)', () => {
    expect(resolveProgressBucket('1', 'unexpected', {})).toBe('done');
  });

  it('ignores map row when stored key does not match entry.statusId (corrupt / legacy payload)', () => {
    const mapping = {
      '1': {
        statusId: '2',
        statusName: 'x',
        bucket: 'done' as const,
      },
    };

    expect(resolveProgressBucket('1', 'new', mapping)).toBe('todo');
  });
});
