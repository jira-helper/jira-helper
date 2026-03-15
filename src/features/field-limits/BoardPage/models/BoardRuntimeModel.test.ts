import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Ok, Err } from 'ts-results';
import { BoardRuntimeModel } from './BoardRuntimeModel';
import type { PropertyModel } from '../../property/PropertyModel';
import type { IFieldLimitsBoardPageObject } from '../page-objects/FieldLimitsBoardPageObject';
import type { IBoardPagePageObject } from 'src/page-objects/BoardPage';
import type { Logger } from 'src/shared/Logger';
import type { FieldLimitsSettings, BoardEditData, FieldLimitStats } from '../../types';
import { CalcType } from '../../types';
import { COLORS } from 'src/shared/constants';

describe('BoardRuntimeModel', () => {
  let mockPropertyModel: PropertyModel;
  let mockFieldLimitsPageObject: IFieldLimitsBoardPageObject;
  let mockBoardPageObject: IBoardPagePageObject;
  let mockLogger: Logger;

  beforeEach(() => {
    mockPropertyModel = {
      load: vi.fn().mockResolvedValue(Ok({ limits: {} })),
      settings: { limits: {} },
    } as unknown as PropertyModel;

    mockFieldLimitsPageObject = {
      selectors: { extraField: '.ghx-extra-field', subnavTitle: '#subnav-title' },
      getFieldNameFromExtraField: vi.fn(),
      getExtraFieldTexts: vi.fn(),
      colorCard: vi.fn(),
      resetCardColor: vi.fn(),
      insertSubnavComponent: vi.fn(),
      removeSubnavComponent: vi.fn(),
    } as unknown as IFieldLimitsBoardPageObject;

    mockBoardPageObject = {} as IBoardPagePageObject;

    mockLogger = {
      getPrefixedLog: vi.fn(() => vi.fn()),
    } as unknown as Logger;
  });

  const defaultBoardEditData: BoardEditData = {
    canEdit: true,
    rapidListConfig: {
      mappedColumns: [],
      currentStatisticsField: { typeId: 'issueCount' },
    },
    swimlanesConfig: { swimlanes: [] },
    cardLayoutConfig: {
      currentFields: [{ fieldId: 'customfield_10001', name: 'Assignee' }],
    },
  };

  describe('initialize', () => {
    it('should load settings, set cardLayoutFields, cssSelectorOfIssues, and call recalculate', async () => {
      const settings: FieldLimitsSettings = {
        limits: {
          'limit-1': {
            calcType: CalcType.EXACT_VALUE,
            fieldId: 'customfield_10001',
            fieldValue: 'Pro',
            limit: 5,
            columns: [],
            swimlanes: [],
            visualValue: 'Pro',
          },
        },
      };
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Ok(settings));

      const model = new BoardRuntimeModel(
        mockPropertyModel,
        mockFieldLimitsPageObject,
        mockBoardPageObject,
        mockLogger
      );

      const result = await model.initialize(defaultBoardEditData);

      expect(result.ok).toBe(true);
      expect(model.settings).toEqual(settings);
      expect(model.cardLayoutFields).toEqual([{ fieldId: 'customfield_10001', name: 'Assignee' }]);
      expect(model.cssSelectorOfIssues).toBe('.ghx-issue');
      expect(model.isInitialized).toBe(true);
      expect(mockPropertyModel.load).toHaveBeenCalledOnce();
    });

    it('should return Err when property model fails to load', async () => {
      const error = new Error('Load failed');
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Err(error));

      const model = new BoardRuntimeModel(
        mockPropertyModel,
        mockFieldLimitsPageObject,
        mockBoardPageObject,
        mockLogger
      );

      const result = await model.initialize(defaultBoardEditData);

      expect(result.err).toBe(true);
      expect(result.val).toEqual(error);
      expect(model.isInitialized).toBe(false);
    });
  });

  describe('getCssSelectorOfIssues', () => {
    it('should return .ghx-issue:not(.ghx-issue-subtask) when typeId is issueCountExclSubs', async () => {
      const boardData: BoardEditData = {
        ...defaultBoardEditData,
        rapidListConfig: {
          ...defaultBoardEditData.rapidListConfig,
          currentStatisticsField: { typeId: 'issueCountExclSubs' },
        },
      };

      const model = new BoardRuntimeModel(
        mockPropertyModel,
        mockFieldLimitsPageObject,
        mockBoardPageObject,
        mockLogger
      );
      await model.initialize(boardData);

      expect(model.cssSelectorOfIssues).toBe('.ghx-issue:not(.ghx-issue-subtask)');
    });

    it('should return .ghx-issue when typeId is not issueCountExclSubs', async () => {
      const model = new BoardRuntimeModel(
        mockPropertyModel,
        mockFieldLimitsPageObject,
        mockBoardPageObject,
        mockLogger
      );
      await model.initialize(defaultBoardEditData);

      expect(model.cssSelectorOfIssues).toBe('.ghx-issue');
    });
  });

  describe('getBadgeColor', () => {
    it('should return OVER_WIP_LIMITS when over limit', () => {
      const model = new BoardRuntimeModel(
        mockPropertyModel,
        mockFieldLimitsPageObject,
        mockBoardPageObject,
        mockLogger
      );
      const stats: FieldLimitStats = {
        current: 6,
        limit: 5,
        isOverLimit: true,
        isOnLimit: false,
        calcType: CalcType.EXACT_VALUE,
        issues: [],
      };
      model.stats = { 'limit-1': stats };

      expect(model.getBadgeColor('limit-1')).toBe(COLORS.OVER_WIP_LIMITS);
    });

    it('should return ON_THE_LIMIT when on limit', () => {
      const model = new BoardRuntimeModel(
        mockPropertyModel,
        mockFieldLimitsPageObject,
        mockBoardPageObject,
        mockLogger
      );
      const stats: FieldLimitStats = {
        current: 5,
        limit: 5,
        isOverLimit: false,
        isOnLimit: true,
        calcType: CalcType.EXACT_VALUE,
        issues: [],
      };
      model.stats = { 'limit-1': stats };

      expect(model.getBadgeColor('limit-1')).toBe(COLORS.ON_THE_LIMIT);
    });

    it('should return BELOW_THE_LIMIT when below limit', () => {
      const model = new BoardRuntimeModel(
        mockPropertyModel,
        mockFieldLimitsPageObject,
        mockBoardPageObject,
        mockLogger
      );
      const stats: FieldLimitStats = {
        current: 3,
        limit: 5,
        isOverLimit: false,
        isOnLimit: false,
        calcType: CalcType.EXACT_VALUE,
        issues: [],
      };
      model.stats = { 'limit-1': stats };

      expect(model.getBadgeColor('limit-1')).toBe(COLORS.BELOW_THE_LIMIT);
    });

    it('should return BELOW_THE_LIMIT for unknown limitKey', () => {
      const model = new BoardRuntimeModel(
        mockPropertyModel,
        mockFieldLimitsPageObject,
        mockBoardPageObject,
        mockLogger
      );

      expect(model.getBadgeColor('unknown')).toBe(COLORS.BELOW_THE_LIMIT);
    });
  });

  describe('getBadgeText', () => {
    it('should return "current/limit" format', () => {
      const model = new BoardRuntimeModel(
        mockPropertyModel,
        mockFieldLimitsPageObject,
        mockBoardPageObject,
        mockLogger
      );
      const stats: FieldLimitStats = {
        current: 3,
        limit: 5,
        isOverLimit: false,
        isOnLimit: false,
        calcType: CalcType.EXACT_VALUE,
        issues: [],
      };
      model.stats = { 'limit-1': stats };

      expect(model.getBadgeText('limit-1')).toBe('3/5');
    });

    it('should return empty string for unknown limitKey', () => {
      const model = new BoardRuntimeModel(
        mockPropertyModel,
        mockFieldLimitsPageObject,
        mockBoardPageObject,
        mockLogger
      );

      expect(model.getBadgeText('unknown')).toBe('');
    });
  });

  describe('isOverLimit', () => {
    it('should return true when over limit', () => {
      const model = new BoardRuntimeModel(
        mockPropertyModel,
        mockFieldLimitsPageObject,
        mockBoardPageObject,
        mockLogger
      );
      model.stats = {
        'limit-1': {
          current: 6,
          limit: 5,
          isOverLimit: true,
          isOnLimit: false,
          calcType: CalcType.EXACT_VALUE,
          issues: [],
        },
      };

      expect(model.isOverLimit('limit-1')).toBe(true);
    });

    it('should return false when not over limit', () => {
      const model = new BoardRuntimeModel(
        mockPropertyModel,
        mockFieldLimitsPageObject,
        mockBoardPageObject,
        mockLogger
      );
      model.stats = {
        'limit-1': {
          current: 3,
          limit: 5,
          isOverLimit: false,
          isOnLimit: false,
          calcType: CalcType.EXACT_VALUE,
          issues: [],
        },
      };

      expect(model.isOverLimit('limit-1')).toBe(false);
    });

    it('should return false for unknown limitKey', () => {
      const model = new BoardRuntimeModel(
        mockPropertyModel,
        mockFieldLimitsPageObject,
        mockBoardPageObject,
        mockLogger
      );

      expect(model.isOverLimit('unknown')).toBe(false);
    });
  });

  describe('reset', () => {
    it('should reset all fields', async () => {
      const settings: FieldLimitsSettings = {
        limits: {
          'limit-1': {
            calcType: CalcType.EXACT_VALUE,
            fieldId: 'cf1',
            fieldValue: 'Pro',
            limit: 5,
            columns: [],
            swimlanes: [],
            visualValue: 'Pro',
          },
        },
      };
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Ok(settings));

      const model = new BoardRuntimeModel(
        mockPropertyModel,
        mockFieldLimitsPageObject,
        mockBoardPageObject,
        mockLogger
      );
      await model.initialize(defaultBoardEditData);

      model.reset();

      expect(model.settings).toEqual({ limits: {} });
      expect(model.stats).toEqual({});
      expect(model.cardLayoutFields).toEqual([]);
      expect(model.isInitialized).toBe(false);
    });
  });

  describe('destroy', () => {
    it('should call resetCardColor for all issues and reset state', () => {
      const mockIssue = document.createElement('div');
      const model = new BoardRuntimeModel(
        mockPropertyModel,
        mockFieldLimitsPageObject,
        mockBoardPageObject,
        mockLogger
      );
      model.stats = {
        'limit-1': {
          current: 6,
          limit: 5,
          isOverLimit: true,
          isOnLimit: false,
          calcType: CalcType.EXACT_VALUE,
          issues: [{ issue: mockIssue, countValues: 1 }],
        },
      };
      model.isInitialized = true;

      model.destroy();

      expect(mockFieldLimitsPageObject.resetCardColor).toHaveBeenCalledWith(mockIssue);
      expect(model.settings).toEqual({ limits: {} });
      expect(model.stats).toEqual({});
      expect(model.isInitialized).toBe(false);
    });
  });

  describe('getLimitStats', () => {
    it('should return stats by limitKey', () => {
      const model = new BoardRuntimeModel(
        mockPropertyModel,
        mockFieldLimitsPageObject,
        mockBoardPageObject,
        mockLogger
      );
      const expectedStats: FieldLimitStats = {
        current: 3,
        limit: 5,
        isOverLimit: false,
        isOnLimit: false,
        calcType: CalcType.EXACT_VALUE,
        issues: [],
      };
      model.stats = { 'limit-1': expectedStats };

      expect(model.getLimitStats('limit-1')).toEqual(expectedStats);
      expect(model.getLimitStats('unknown')).toBeUndefined();
    });
  });
});
