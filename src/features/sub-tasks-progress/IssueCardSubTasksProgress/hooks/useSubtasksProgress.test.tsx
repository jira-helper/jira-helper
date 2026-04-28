import { describe, expect, it } from 'vitest';
import type { JiraIssueMapped } from 'src/infrastructure/jira/types';
import type { StatusProgressMapping } from 'src/shared/status-progress-mapping/types';
import { calcProgress } from './useSubtasksProgress';

const texts = {
  flaggedIssue: 'Flagged issue',
  blockedByLinks: 'Blocked by links',
};

function issue(overrides: Partial<JiraIssueMapped>): JiraIssueMapped {
  return {
    id: '10001',
    key: 'TEST-1',
    project: 'TEST',
    summary: 'Sub-task',
    status: 'In Progress',
    statusId: 10001,
    statusCategory: 'indeterminate',
    statusColor: 'yellow',
    assignee: '',
    created: '2026-04-28T00:00:00.000Z',
    reporter: '',
    priority: '',
    creator: '',
    issueType: 'Sub-task',
    issueTypeName: 'Sub-task',
    isFlagged: false,
    isBlockedByLinks: false,
    fields: {
      subtasks: [],
      issuelinks: [],
    },
    ...overrides,
  } as JiraIssueMapped;
}

describe('calcProgress statusProgressMapping', () => {
  it('counts a sub-task in the configured bucket by status id', () => {
    const mapping: StatusProgressMapping = {
      '10001': { statusId: '10001', statusName: 'In Progress', bucket: 'done' },
    };

    const result = calcProgress(
      [issue({ statusId: 10001, statusCategory: 'indeterminate' })],
      { flagsAsBlocked: true, blockedByLinksAsBlocked: true, statusProgressMapping: mapping },
      texts
    );

    expect(result.progress).toEqual({ todo: 0, inProgress: 0, done: 1, blocked: 0 });
  });

  it('ignores fallback status names when status id differs', () => {
    const mapping: StatusProgressMapping = {
      '10002': { statusId: '10002', statusName: 'In Progress', bucket: 'done' },
    };

    const result = calcProgress(
      [issue({ statusId: 10001, status: 'In Progress', statusCategory: 'indeterminate' })],
      { flagsAsBlocked: true, blockedByLinksAsBlocked: true, statusProgressMapping: mapping },
      texts
    );

    expect(result.progress).toEqual({ todo: 0, inProgress: 1, done: 0, blocked: 0 });
  });

  it('keeps default Jira category behavior when mapping is missing', () => {
    const result = calcProgress(
      [issue({ statusId: 10001, statusCategory: 'new' })],
      { flagsAsBlocked: true, blockedByLinksAsBlocked: true },
      texts
    );

    expect(result.progress).toEqual({ todo: 1, inProgress: 0, done: 0, blocked: 0 });
  });

  it('applies blocked overrides after custom status mapping', () => {
    const mapping: StatusProgressMapping = {
      '10001': { statusId: '10001', statusName: 'In Progress', bucket: 'done' },
    };

    const result = calcProgress(
      [issue({ statusId: 10001, statusCategory: 'indeterminate', isFlagged: true })],
      { flagsAsBlocked: true, blockedByLinksAsBlocked: true, statusProgressMapping: mapping },
      texts
    );

    expect(result.progress).toEqual({ todo: 0, inProgress: 0, done: 0, blocked: 1 });
    expect(result.comments).toEqual(['Flagged issue: TEST-1']);
  });
});
