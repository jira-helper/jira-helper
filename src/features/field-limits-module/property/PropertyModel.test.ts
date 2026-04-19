import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PropertyModel } from './PropertyModel';
import type { BoardPropertyServiceI } from 'src/shared/boardPropertyService';
import type { Logger } from 'src/shared/Logger';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import type { FieldLimitsSettings } from '../types';
import { CalcType } from '../types';

describe('PropertyModel', () => {
  let mockBoardPropertyService: BoardPropertyServiceI;
  let mockLogger: Logger;

  beforeEach(() => {
    mockBoardPropertyService = {
      getBoardProperty: vi.fn(),
      updateBoardProperty: vi.fn(),
      deleteBoardProperty: vi.fn(),
    };
    mockLogger = {
      getPrefixedLog: vi.fn(() => vi.fn()),
    } as unknown as Logger;
  });

  describe('load', () => {
    it('should load settings on success', async () => {
      const settings: FieldLimitsSettings = {
        limits: {
          key1: {
            calcType: CalcType.EXACT_VALUE,
            fieldValue: 'Pro',
            fieldId: 'f1',
            limit: 5,
            columns: [],
            swimlanes: [],
            visualValue: 'Pro',
          },
        },
      };
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockResolvedValueOnce(settings);

      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      const result = await model.load();

      expect(result.ok).toBe(true);
      expect(model.settings).toEqual(settings);
      expect(model.state).toBe('loaded');
      expect(model.error).toBeNull();
      expect(mockBoardPropertyService.getBoardProperty).toHaveBeenCalledWith(BOARD_PROPERTIES.FIELD_LIMITS);
    });

    it('should return empty settings when property does not exist', async () => {
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockResolvedValueOnce(undefined);

      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      const result = await model.load();

      expect(result.ok).toBe(true);
      expect(model.settings).toEqual({ limits: {} });
      expect(model.state).toBe('loaded');
    });

    it('should set error state when load fails', async () => {
      const error = new Error('Network error');
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockRejectedValue(error);

      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      const result = await model.load();

      expect(result.err).toBe(true);
      expect(model.state).toBe('error');
      expect(model.error).toBe('Network error');
    });

    it('should skip load when already loading', async () => {
      let resolveFirst: (value: FieldLimitsSettings | undefined) => void;
      const firstPromise = new Promise<FieldLimitsSettings | undefined>(resolve => {
        resolveFirst = resolve;
      });
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockImplementation(
        () => firstPromise as Promise<FieldLimitsSettings | undefined>
      );

      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      const load1Promise = model.load();
      await new Promise(r => setTimeout(r, 0));
      const load2Promise = model.load();

      resolveFirst!({ limits: {} });
      await Promise.all([load1Promise, load2Promise]);

      expect(mockBoardPropertyService.getBoardProperty).toHaveBeenCalledTimes(1);
    });
  });

  describe('save', () => {
    it('should save settings on success', async () => {
      const settings: FieldLimitsSettings = {
        limits: {
          key1: {
            calcType: CalcType.EXACT_VALUE,
            fieldValue: 'Pro',
            fieldId: 'f1',
            limit: 5,
            columns: [],
            swimlanes: [],
            visualValue: 'Pro',
          },
        },
      };
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);

      const result = await model.save(settings);

      expect(result.ok).toBe(true);
      expect(mockBoardPropertyService.updateBoardProperty).toHaveBeenCalledWith(
        BOARD_PROPERTIES.FIELD_LIMITS,
        settings,
        {}
      );
      expect(model.settings).toEqual(settings);
    });

    it('should return error when save fails', async () => {
      const error = new Error('Save failed');
      vi.mocked(mockBoardPropertyService.updateBoardProperty).mockImplementation(() => {
        throw error;
      });
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);

      const result = await model.save({ limits: {} });

      expect(result.err).toBe(true);
      expect(result.val).toEqual(error);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      model.settings = {
        limits: {
          k: {
            calcType: CalcType.EXACT_VALUE,
            fieldValue: 'v',
            fieldId: 'f',
            limit: 1,
            columns: [],
            swimlanes: [],
            visualValue: 'v',
          },
        },
      };
      model.state = 'loaded';
      model.error = 'Some error';

      model.reset();

      expect(model.settings).toEqual({ limits: {} });
      expect(model.state).toBe('initial');
      expect(model.error).toBeNull();
    });
  });
});
