import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PropertyModel } from './PropertyModel';
import type { BoardPropertyServiceI } from 'src/shared/boardPropertyService';
import type { Logger } from 'src/shared/Logger';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import type { WipLimitsProperty } from '../types';

describe('column-limits PropertyModel', () => {
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
    it('should load WIP limits property on success', async () => {
      // Arrange
      const data: WipLimitsProperty = {
        g1: { columns: ['c1'], max: 5 },
      };
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockResolvedValueOnce(data);
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);

      // Act
      const result = await model.load();

      // Assert
      expect(result.ok).toBe(true);
      expect(result.val).toEqual(data);
      expect(model.data).toEqual(data);
      expect(model.state).toBe('loaded');
      expect(model.error).toBeNull();
      expect(mockBoardPropertyService.getBoardProperty).toHaveBeenCalledWith(BOARD_PROPERTIES.WIP_LIMITS_SETTINGS);
    });

    it('should normalize undefined API result to empty object', async () => {
      // Arrange
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockResolvedValueOnce(undefined);
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);

      // Act
      const result = await model.load();

      // Assert
      expect(result.ok).toBe(true);
      expect(model.data).toEqual({});
      expect(model.state).toBe('loaded');
    });

    it('should treat missing board id as empty loaded state (legacy load parity)', async () => {
      // Arrange
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockRejectedValueOnce(new Error('no board id'));
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);

      // Act
      const result = await model.load();

      // Assert
      expect(result.ok).toBe(true);
      expect(model.data).toEqual({});
      expect(model.state).toBe('loaded');
      expect(model.error).toBeNull();
    });

    it('should set error and return Err when load fails', async () => {
      // Arrange
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockRejectedValueOnce(new Error('Network error'));
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);

      // Act
      const result = await model.load();

      // Assert
      expect(result.err).toBe(true);
      expect(model.state).toBe('initial');
      expect(model.error).toBe('Network error');
    });

    it('should skip second load while already loading', async () => {
      // Arrange
      let resolveFirst: (value: WipLimitsProperty | undefined) => void;
      const firstPromise = new Promise<WipLimitsProperty | undefined>(resolve => {
        resolveFirst = resolve;
      });
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockImplementation(
        () => firstPromise as Promise<WipLimitsProperty | undefined>
      );
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);

      // Act
      const load1Promise = model.load();
      await new Promise(r => setTimeout(r, 0));
      const load2Promise = model.load();

      resolveFirst!({ g1: { columns: [] } });
      const [load1, load2] = await Promise.all([load1Promise, load2Promise]);

      // Assert
      expect(mockBoardPropertyService.getBoardProperty).toHaveBeenCalledTimes(1);
      expect(load1.ok).toBe(true);
      expect(load2.ok).toBe(true);
    });
  });

  describe('persist', () => {
    it('should save current data with WIP_LIMITS_SETTINGS key', async () => {
      // Arrange
      const data: WipLimitsProperty = { g1: { columns: ['x'], max: 2 } };
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      model.setData(data);

      // Act
      const result = await model.persist();

      // Assert
      expect(result.ok).toBe(true);
      expect(mockBoardPropertyService.updateBoardProperty).toHaveBeenCalledWith(
        BOARD_PROPERTIES.WIP_LIMITS_SETTINGS,
        data,
        {}
      );
    });

    it('should return Err when persist fails', async () => {
      // Arrange
      const error = new Error('no board id');
      vi.mocked(mockBoardPropertyService.updateBoardProperty).mockImplementation(() => {
        throw error;
      });
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      model.setData({ g1: { columns: [] } });

      // Act
      const result = await model.persist();

      // Assert
      expect(result.err).toBe(true);
      expect(result.val).toEqual(error);
    });
  });

  describe('setData', () => {
    it('should replace data and set state to loaded', () => {
      // Arrange
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      const next: WipLimitsProperty = { a: { columns: ['1'] } };

      // Act
      model.setData(next);

      // Assert
      expect(model.data).toEqual(next);
      expect(model.state).toBe('loaded');
    });
  });

  describe('reset', () => {
    it('should reset data, state and error', () => {
      // Arrange
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      model.setData({ g: { columns: [] } });
      model.error = 'x';

      // Act
      model.reset();

      // Assert
      expect(model.data).toEqual({});
      expect(model.state).toBe('initial');
      expect(model.error).toBeNull();
    });
  });
});
