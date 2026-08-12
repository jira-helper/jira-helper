import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IBoardPagePageObject } from '../BoardPagePageObject';
import { getBoardEditDataCloud, getProjectIssueTypesCloud } from '../jiraApi.cloud';

function createEditModelResponse() {
  return {
    canEdit: true,
    rapidListConfig: {
      currentStatisticsField: { typeId: 'none' },
      mappedColumns: [
        { id: 118, name: 'Бэклог', isKanPlanColumn: true, mappedStatuses: [] },
        { id: 115, name: 'К выполнению', isKanPlanColumn: false, mappedStatuses: [{ id: '10074', name: 'To Do' }] },
        { id: 116, name: 'В работе', isKanPlanColumn: false, mappedStatuses: [{ id: '10075', name: 'In Progress' }] },
        { id: 119, name: 'Пустая колонка', isKanPlanColumn: false, mappedStatuses: [] },
        { id: 117, name: 'Готово', isKanPlanColumn: false, mappedStatuses: [{ id: '10076', name: 'Done' }] },
      ],
    },
    swimlanesConfig: {
      swimlanes: [{ id: 'sw1', name: 'Default' }],
    },
  };
}

describe('getBoardEditDataCloud', () => {
  let boardPage: IBoardPagePageObject;
  let setCachedColumns: ReturnType<typeof vi.fn>;
  let setBoardWorkData: ReturnType<typeof vi.fn>;
  let setSwimlanesCache: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    setCachedColumns = vi.fn();
    setBoardWorkData = vi.fn();
    setSwimlanesCache = vi.fn();
    boardPage = {
      getBoardId: vi.fn(() => 35),
      setCachedColumns,
      setBoardWorkData,
      setSwimlanesCache,
    } as unknown as IBoardPagePageObject;
  });

  it('returns visible mappedColumns from greenhopper editmodel and caches them', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => createEditModelResponse(),
      })
    );

    const result = await getBoardEditDataCloud(boardPage);

    expect(fetch).toHaveBeenCalledWith(
      '/rest/greenhopper/1.0/rapidviewconfig/editmodel.json?rapidViewId=35',
      expect.objectContaining({ credentials: 'same-origin' })
    );

    expect(result.canEdit).toBe(true);
    expect(result.rapidListConfig?.currentStatisticsField).toEqual({ typeId: 'none' });
    expect(result.rapidListConfig?.mappedColumns).toEqual([
      { id: '115', name: 'К выполнению', isKanPlanColumn: false },
      { id: '116', name: 'В работе', isKanPlanColumn: false },
      { id: '117', name: 'Готово', isKanPlanColumn: false },
    ]);
    expect(result.rapidListConfig?.mappedColumns?.every(col => col.isKanPlanColumn !== true)).toBe(true);
    expect(setCachedColumns).toHaveBeenCalledWith([
      { id: '115', name: 'К выполнению', statusIds: ['10074'] },
      { id: '116', name: 'В работе', statusIds: ['10075'] },
      { id: '117', name: 'Готово', statusIds: ['10076'] },
    ]);
    expect(result.swimlanesConfig?.swimlanes).toEqual([{ id: 'sw1', name: 'Default' }]);
  });

  it('fetches allData and calls setBoardWorkData with swimlane issue counts', async () => {
    const allDataResponse = {
      columnsData: {
        columns: [
          { id: '115', name: 'To Do', statusIds: ['10074'] },
          { id: '116', name: 'In Progress', statusIds: ['10075'] },
        ],
      },
      swimlanesData: {
        customSwimlanesData: {
          swimlanes: [
            { id: '9', name: 'pri', issueIds: [1, 2, 3] },
            { id: '6', name: 'Expedite', issueIds: [4, 5] },
          ],
        },
      },
      issuesData: {
        issues: [
          {
            id: 1,
            key: 'TRB3-1',
            statusId: '10074',
            typeName: 'Story',
            assigneeAccountId: 'acct-1',
            assigneeName: 'Alice',
          },
          { id: 2, statusId: '10074', typeName: 'Story' },
          { id: 3, statusId: '10074', typeName: 'Story' },
          { id: 4, statusId: '10074', typeName: 'Story' },
          { id: 5, statusId: '10074', typeName: 'Story' },
        ],
      },
    };

    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.includes('editmodel.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => createEditModelResponse(),
          });
        }
        if (url.includes('allData.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => allDataResponse,
          });
        }
        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      })
    );

    await getBoardEditDataCloud(boardPage);

    expect(fetch).toHaveBeenCalledWith(
      '/rest/greenhopper/1.0/xboard/work/allData.json?rapidViewId=35',
      expect.objectContaining({ credentials: 'same-origin' })
    );
    expect(setBoardWorkData).toHaveBeenCalledWith({
      columns: [
        { id: '115', name: 'К выполнению', statusIds: ['10074'] },
        { id: '116', name: 'В работе', statusIds: ['10075'] },
        { id: '117', name: 'Готово', statusIds: ['10076'] },
      ],
      swimlanes: [
        { id: '9', name: 'pri', issueIds: [1, 2, 3] },
        { id: '6', name: 'Expedite', issueIds: [4, 5] },
      ],
      issues: [
        {
          id: 1,
          key: 'TRB3-1',
          statusId: '10074',
          typeName: 'Story',
          assigneeAccountId: 'acct-1',
          assigneeName: 'Alice',
        },
        { id: 2, statusId: '10074', typeName: 'Story' },
        { id: 3, statusId: '10074', typeName: 'Story' },
        { id: 4, statusId: '10074', typeName: 'Story' },
        { id: 5, statusId: '10074', typeName: 'Story' },
      ],
    });
    expect(setSwimlanesCache).toHaveBeenCalledWith([{ id: 'sw1', name: 'Default' }]);
  });

  it('continues without work data when allData fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn((url: string) => {
        if (url.includes('editmodel.json')) {
          return Promise.resolve({
            ok: true,
            json: async () => createEditModelResponse(),
          });
        }
        if (url.includes('allData.json')) {
          return Promise.resolve({ ok: false, status: 500 });
        }
        return Promise.reject(new Error(`Unexpected fetch: ${url}`));
      })
    );

    const result = await getBoardEditDataCloud(boardPage);

    expect(result.canEdit).toBe(true);
    expect(setCachedColumns).toHaveBeenCalled();
    expect(setBoardWorkData).not.toHaveBeenCalled();
    expect(setSwimlanesCache).toHaveBeenCalledWith([{ id: 'sw1', name: 'Default' }]);
  });

  it('returns canEdit false when fetch response is not ok', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
      })
    );

    const result = await getBoardEditDataCloud(boardPage);

    expect(result).toEqual({ canEdit: false });
    expect(setCachedColumns).not.toHaveBeenCalled();
  });

  it('returns canEdit false when aborted', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(
        () =>
          new Promise(resolve => {
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => createEditModelResponse(),
                }),
              50
            );
          })
      )
    );

    const abortPromise = new Promise<void>(resolve => {
      setTimeout(resolve, 0);
    });

    const result = await getBoardEditDataCloud(boardPage, abortPromise);

    expect(result).toEqual({ canEdit: false });
    expect(setCachedColumns).not.toHaveBeenCalled();
  });

  it('returns canEdit false when board id is missing', async () => {
    vi.stubGlobal('fetch', vi.fn());
    boardPage = {
      getBoardId: vi.fn(() => null),
      setCachedColumns,
    } as unknown as IBoardPagePageObject;

    const result = await getBoardEditDataCloud(boardPage);

    expect(result).toEqual({});
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('getProjectIssueTypesCloud', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads issue types from Cloud project REST', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          issueTypes: [
            { id: '10047', name: 'Задача', subtask: false },
            { id: '10046', name: 'Подзадача', subtask: true },
          ],
        }),
      })
    );

    const types = await getProjectIssueTypesCloud('TRB3');

    expect(fetch).toHaveBeenCalledWith(
      '/rest/api/2/project/TRB3',
      expect.objectContaining({ credentials: 'same-origin' })
    );
    expect(types).toEqual([
      { id: '10047', name: 'Задача', subtask: false },
      { id: '10046', name: 'Подзадача', subtask: true },
    ]);
  });

  it('returns empty list when project key is blank or API fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    expect(await getProjectIssueTypesCloud('   ')).toEqual([]);
    expect(await getProjectIssueTypesCloud('MISSING')).toEqual([]);
  });
});
