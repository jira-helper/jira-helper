import { describe, it, expect } from 'vitest';
import { buildInitDataFromColumns, buildInitDataFromGroupMap } from './buildInitData';
import type { Column, WipLimitsProperty } from '../../types';
import { WITHOUT_GROUP_ID } from '../../types';
import type { GroupMap } from '../../shared/utils';

describe('buildInitDataFromColumns', () => {
  it('maps all columns to withoutGroup when wipLimits is empty', () => {
    const columns: Column[] = [
      { id: 'c1', name: 'To Do' },
      { id: 'c2', name: 'In Progress' },
    ];
    const wipLimits: WipLimitsProperty = {};

    const result = buildInitDataFromColumns(columns, wipLimits);

    expect(result.withoutGroupColumns).toEqual(columns);
    expect(result.groups).toEqual([]);
    expect(result.issueTypeSelectorStates).toEqual({});
  });

  it('maps columns not listed in any group to withoutGroupColumns', () => {
    const columns: Column[] = [
      { id: 'c1', name: 'A' },
      { id: 'orphan', name: 'Orphan' },
    ];
    const wipLimits: WipLimitsProperty = {
      g1: { columns: ['c1'], max: 3 },
    };

    const result = buildInitDataFromColumns(columns, wipLimits);

    expect(result.withoutGroupColumns).toEqual([{ id: 'orphan', name: 'Orphan' }]);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0]).toMatchObject({
      id: 'g1',
      columns: [{ id: 'c1', name: 'A' }],
      max: 3,
    });
  });

  it('splits several named groups and preserves column order within each group', () => {
    const columns: Column[] = [
      { id: 'a2', name: 'A2' },
      { id: 'b1', name: 'B1' },
      { id: 'a1', name: 'A1' },
    ];
    const wipLimits: WipLimitsProperty = {
      teamA: { columns: ['a1', 'a2'], max: 5, customHexColor: '#111111' },
      teamB: { columns: ['b1'], max: 2 },
    };

    const result = buildInitDataFromColumns(columns, wipLimits);

    expect(result.withoutGroupColumns).toEqual([]);
    const groupA = result.groups.find(g => g.id === 'teamA');
    const groupB = result.groups.find(g => g.id === 'teamB');
    expect(groupA?.columns).toEqual([
      { id: 'a2', name: 'A2' },
      { id: 'a1', name: 'A1' },
    ]);
    expect(groupB?.columns).toEqual([{ id: 'b1', name: 'B1' }]);
    expect(groupA).toMatchObject({ max: 5, customHexColor: '#111111' });
    expect(groupB).toMatchObject({ max: 2 });
  });

  it('puts columns from property WITHOUT_GROUP_ID into withoutGroupColumns (not groups)', () => {
    const columns: Column[] = [
      { id: 'in-group', name: 'G' },
      { id: 'in-without', name: 'W' },
    ];
    const wipLimits: WipLimitsProperty = {
      [WITHOUT_GROUP_ID]: { columns: ['in-without'], max: 1 },
      named: { columns: ['in-group'], max: 10 },
    };

    const result = buildInitDataFromColumns(columns, wipLimits);

    expect(result.withoutGroupColumns).toEqual([{ id: 'in-without', name: 'W' }]);
    expect(result.groups).toHaveLength(1);
    expect(result.groups[0].id).toBe('named');
    expect(result.issueTypeSelectorStates![WITHOUT_GROUP_ID]).toBeUndefined();
    expect(result.issueTypeSelectorStates!.named).toEqual({
      countAllTypes: true,
      projectKey: '',
      selectedTypes: [],
    });
  });

  describe('issueTypeSelectorStates', () => {
    it('sets countAllTypes true when includedIssueTypes is absent or empty', () => {
      const columns: Column[] = [{ id: 'c1', name: 'C1' }];
      const wipLimitsEmptyTypes: WipLimitsProperty = {
        g1: { columns: ['c1'], includedIssueTypes: [] },
      };
      expect(buildInitDataFromColumns(columns, wipLimitsEmptyTypes).issueTypeSelectorStates!.g1).toEqual({
        countAllTypes: true,
        projectKey: '',
        selectedTypes: [],
      });

      const wipLimitsNoTypes: WipLimitsProperty = {
        g1: { columns: ['c1'] },
      };
      expect(buildInitDataFromColumns(columns, wipLimitsNoTypes).issueTypeSelectorStates!.g1).toEqual({
        countAllTypes: true,
        projectKey: '',
        selectedTypes: [],
      });
    });

    it('sets countAllTypes false and selectedTypes when issue types are restricted', () => {
      const columns: Column[] = [{ id: 'c1', name: 'C1' }];
      const wipLimits: WipLimitsProperty = {
        g1: { columns: ['c1'], includedIssueTypes: ['Task', 'Bug'] },
      };

      const result = buildInitDataFromColumns(columns, wipLimits);

      expect(result.issueTypeSelectorStates!.g1).toEqual({
        countAllTypes: false,
        projectKey: '',
        selectedTypes: ['Task', 'Bug'],
      });
    });
  });

  it('matches buildInitDataFromGroupMap for the same column membership (parity)', () => {
    const c1 = document.createElement('div');
    const c2 = document.createElement('div');
    const orphan = document.createElement('div');
    const wipLimits: WipLimitsProperty = {
      alpha: { columns: ['c1'], max: 7, includedIssueTypes: ['Story'] },
    };
    const groupMap: GroupMap = {
      allGroupIds: ['alpha', WITHOUT_GROUP_ID],
      byGroupId: {
        alpha: {
          allColumnIds: ['c1'],
          byColumnId: { c1: { column: c1, id: 'c1' } },
        },
        [WITHOUT_GROUP_ID]: {
          allColumnIds: ['c2', 'orphan'],
          byColumnId: {
            c2: { column: c2, id: 'c2' },
            orphan: { column: orphan, id: 'orphan' },
          },
        },
      },
    };
    const columns: Column[] = [
      { id: 'c1', name: 'Col1' },
      { id: 'c2', name: 'Col2' },
      { id: 'orphan', name: 'Orphan' },
    ];
    const nameById = Object.fromEntries(columns.map(c => [c.id, c.name])) as Record<string, string>;
    const idByEl = new Map<HTMLElement, string>([
      [c1, 'c1'],
      [c2, 'c2'],
      [orphan, 'orphan'],
    ]);
    const fromMap = buildInitDataFromGroupMap(groupMap, wipLimits, el => nameById[idByEl.get(el)!] ?? '');
    const fromColumns = buildInitDataFromColumns(columns, wipLimits);

    expect(fromColumns).toEqual(fromMap);
  });

  it('passes through swimlanes from wipLimits', () => {
    const columns: Column[] = [{ id: 'c1', name: 'C1' }];
    const swimlanes = [{ id: 'sl1', name: 'Lane 1' }];
    const wipLimits: WipLimitsProperty = {
      g1: { columns: ['c1'], swimlanes },
    };

    const result = buildInitDataFromColumns(columns, wipLimits);

    expect(result.groups[0].swimlanes).toEqual(swimlanes);
  });
});
