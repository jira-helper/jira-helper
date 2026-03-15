import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BoardPageModification } from './BoardPageModification';
import * as routing from 'src/routing';
import * as jiraApi from 'src/shared/jiraApi';
import { BOARD_PROPERTIES } from 'src/shared/constants';

vi.mock('src/routing', async importOriginal => {
  const original = await importOriginal<typeof routing>();
  return {
    ...original,
    getSearchParam: vi.fn(),
    getBoardIdFromURL: vi.fn(),
  };
});

vi.mock('src/shared/jiraApi', () => ({
  getBoardEditData: vi.fn(),
  getBoardProperty: vi.fn(),
}));

describe('BoardPageModification', () => {
  let modification: BoardPageModification;

  beforeEach(() => {
    modification = new BoardPageModification();
    document.body.innerHTML = '';
    vi.mocked(routing.getBoardIdFromURL).mockReturnValue('123');
    vi.mocked(jiraApi.getBoardEditData).mockResolvedValue({
      canEdit: true,
      rapidListConfig: {},
      swimlanesConfig: {},
      cardLayoutConfig: {},
    });
    vi.mocked(jiraApi.getBoardProperty).mockResolvedValue({ limits: {} });
  });

  afterEach(() => {
    modification.clear();
    vi.clearAllMocks();
  });

  describe('shouldApply', () => {
    it('should return true when view is null', () => {
      vi.mocked(routing.getSearchParam).mockReturnValue(null);
      expect(modification.shouldApply()).toBe(true);
    });

    it('should return true when view is detail', () => {
      vi.mocked(routing.getSearchParam).mockReturnValue('detail');
      expect(modification.shouldApply()).toBe(true);
    });

    it('should return false when view is not detail', () => {
      vi.mocked(routing.getSearchParam).mockReturnValue('plan');
      expect(modification.shouldApply()).toBe(false);
    });
  });

  describe('getModificationId', () => {
    it('should return id with field-limits-board prefix', () => {
      vi.mocked(routing.getBoardIdFromURL).mockReturnValue('456');
      expect(modification.getModificationId()).toBe('field-limits-board-456');
    });
  });

  describe('waitForLoading', () => {
    it('should wait for .ghx-swimlane element', async () => {
      const swimlane = document.createElement('div');
      swimlane.className = 'ghx-swimlane';
      document.body.appendChild(swimlane);

      const result = await modification.waitForLoading();
      expect(result).toBe(swimlane);
    });
  });

  describe('loadData', () => {
    it('should return boardEditData and fieldLimits', async () => {
      const boardEditData = {
        canEdit: true,
        rapidListConfig: { mappedColumns: [] },
        swimlanesConfig: { swimlanes: [] },
        cardLayoutConfig: { currentFields: [] },
      };
      const fieldLimits = { limits: { key1: {} as any } };

      vi.mocked(jiraApi.getBoardEditData).mockResolvedValue(boardEditData);
      vi.mocked(jiraApi.getBoardProperty).mockResolvedValue(fieldLimits);

      const result = await modification.loadData();

      expect(result).toEqual([boardEditData, fieldLimits]);
      expect(jiraApi.getBoardProperty).toHaveBeenCalledWith('123', BOARD_PROPERTIES.FIELD_LIMITS, expect.any(Object));
    });

    it('should return empty limits when getBoardProperty returns null', async () => {
      const boardEditData = { canEdit: true, rapidListConfig: {}, swimlanesConfig: {}, cardLayoutConfig: {} };
      vi.mocked(jiraApi.getBoardEditData).mockResolvedValue(boardEditData);
      vi.mocked(jiraApi.getBoardProperty).mockResolvedValue(null);

      const result = await modification.loadData();

      expect(result).toEqual([boardEditData, { limits: {} }]);
    });
  });
});
