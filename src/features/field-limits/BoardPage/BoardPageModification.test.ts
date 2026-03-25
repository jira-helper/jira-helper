import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { globalContainer } from 'dioma';
import { BoardPageModification } from './BoardPageModification';
import type { IRoutingService } from 'src/routing';
import { routingServiceToken } from 'src/routing';
import { registerRoutingInDI } from 'src/shared/di/routingTokens';
import { registerExtensionApiServiceInDI } from 'src/shared/ExtensionApiService';
import * as jiraApi from 'src/shared/jiraApi';
import { BOARD_PROPERTIES } from 'src/shared/constants';

vi.mock('src/shared/jiraApi', () => ({
  getBoardEditData: vi.fn(),
  getBoardProperty: vi.fn(),
}));

describe('BoardPageModification', () => {
  let modification: BoardPageModification;
  const mockGetSearchParam = vi.fn();
  const mockGetBoardIdFromURL = vi.fn();

  beforeEach(() => {
    globalContainer.reset();
    registerExtensionApiServiceInDI(globalContainer);
    const mockRouting: IRoutingService = {
      getSearchParam: mockGetSearchParam,
      getBoardIdFromURL: mockGetBoardIdFromURL,
      getReportNameFromURL: vi.fn(),
      getCurrentRoute: vi.fn(),
      getSettingsTab: vi.fn(),
      getIssueId: vi.fn(),
      getProjectKeyFromURL: vi.fn(),
      onUrlChange: vi.fn(),
    };
    globalContainer.register({ token: routingServiceToken, value: mockRouting });
    registerRoutingInDI(globalContainer);

    modification = new BoardPageModification();
    document.body.innerHTML = '';
    mockGetBoardIdFromURL.mockReturnValue('123');
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
      mockGetSearchParam.mockReturnValue(null);
      expect(modification.shouldApply()).toBe(true);
    });

    it('should return true when view is detail', () => {
      mockGetSearchParam.mockReturnValue('detail');
      expect(modification.shouldApply()).toBe(true);
    });

    it('should return false when view is not detail', () => {
      mockGetSearchParam.mockReturnValue('plan');
      expect(modification.shouldApply()).toBe(false);
    });
  });

  describe('getModificationId', () => {
    it('should return id with field-limits-board prefix', () => {
      mockGetBoardIdFromURL.mockReturnValue('456');
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
