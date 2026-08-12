import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { IBoardPagePageObject } from '../BoardPagePageObject';
import { getBoardEditDataCloud } from '../jiraApi.cloud';

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

  beforeEach(() => {
    setCachedColumns = vi.fn();
    boardPage = {
      getBoardId: vi.fn(() => 35),
      setCachedColumns,
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
      { id: '115', name: 'К выполнению' },
      { id: '116', name: 'В работе' },
      { id: '117', name: 'Готово' },
    ]);
    expect(result.swimlanesConfig?.swimlanes).toEqual([{ id: 'sw1', name: 'Default' }]);
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
