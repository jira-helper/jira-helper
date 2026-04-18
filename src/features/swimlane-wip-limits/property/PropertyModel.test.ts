import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PropertyModel } from './PropertyModel';
import type { BoardPropertyServiceI } from 'src/shared/boardPropertyService';
import type { Logger } from 'src/shared/Logger';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import type { SwimlaneSettings } from '../types';

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
    it('should load and merge settings on success', async () => {
      // Arrange
      const newSettings = { swim1: { limit: 5, columns: ['In Progress'] } };
      const oldSettings = { swim2: { limit: 3 } as any };
      vi.mocked(mockBoardPropertyService.getBoardProperty)
        .mockResolvedValueOnce(newSettings)
        .mockResolvedValueOnce(oldSettings);

      const model = new PropertyModel(mockBoardPropertyService, mockLogger);

      // Act
      const result = await model.load();

      // Assert
      expect(result.ok).toBe(true);
      expect(model.settings).toEqual({
        swim1: { limit: 5, columns: ['In Progress'] },
        swim2: { limit: 3, columns: [] },
      });
      expect(model.state).toBe('loaded');
      expect(model.error).toBeNull();
      expect(mockBoardPropertyService.getBoardProperty).toHaveBeenCalledWith(BOARD_PROPERTIES.SWIMLANE_SETTINGS);
      expect(mockBoardPropertyService.getBoardProperty).toHaveBeenCalledWith(BOARD_PROPERTIES.OLD_SWIMLANE_SETTINGS);
    });

    it('should set error state when load fails', async () => {
      // Arrange
      const error = new Error('Network error');
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockRejectedValue(error);

      const model = new PropertyModel(mockBoardPropertyService, mockLogger);

      // Act
      const result = await model.load();

      // Assert
      expect(result.err).toBe(true);
      expect(model.state).toBe('error');
      expect(model.error).toBe('Network error');
    });

    it('should skip load when already loading', async () => {
      // Arrange - slow first load so second load runs while first is in progress
      let resolveFirst: (value: SwimlaneSettings | undefined) => void;
      const firstPromise = new Promise<SwimlaneSettings | undefined>(resolve => {
        resolveFirst = resolve;
      });
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockImplementation(
        () => firstPromise as Promise<SwimlaneSettings | undefined>
      );

      const model = new PropertyModel(mockBoardPropertyService, mockLogger);

      // Act - start first load, then second while first is awaiting
      const load1Promise = model.load();
      await new Promise(r => setTimeout(r, 0)); // allow first load to set state='loading'
      const load2Promise = model.load();

      resolveFirst!({ swim1: { limit: 5, columns: [] } });
      await Promise.all([load1Promise, load2Promise]);

      // Assert - getBoardProperty called 2 times (first load only: SWIMLANE + OLD)
      expect(mockBoardPropertyService.getBoardProperty).toHaveBeenCalledTimes(2);
    });
  });

  describe('save', () => {
    it('should save settings on success', async () => {
      // Arrange
      const settings: SwimlaneSettings = {
        swim1: { limit: 5, columns: [] },
      };
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      model.settings = {};

      // Act
      const result = await model.save(settings);

      // Assert
      expect(result.ok).toBe(true);
      expect(mockBoardPropertyService.updateBoardProperty).toHaveBeenCalledWith(
        BOARD_PROPERTIES.SWIMLANE_SETTINGS,
        settings,
        {}
      );
      expect(model.settings).toEqual(settings);
    });

    it('should return error when save fails', async () => {
      // Arrange
      const error = new Error('Save failed');
      vi.mocked(mockBoardPropertyService.updateBoardProperty).mockImplementation(() => {
        throw error;
      });
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);

      // Act
      const result = await model.save({ swim1: { limit: 5, columns: [] } });

      // Assert
      expect(result.err).toBe(true);
      expect(result.val).toEqual(error);
    });
  });

  describe('updateSwimlane', () => {
    it('should update existing swimlane setting', () => {
      // Arrange
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      model.settings = { swim1: { limit: 3, columns: [] } };

      // Act
      model.updateSwimlane('swim1', { limit: 5 });

      // Assert
      expect(model.settings.swim1).toEqual({ limit: 5, columns: [] });
    });

    it('should create new swimlane when not exists', () => {
      // Arrange
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      model.settings = {};

      // Act
      model.updateSwimlane('swim1', { limit: 5, columns: ['In Progress'] });

      // Assert
      expect(model.settings.swim1).toEqual({ limit: 5, columns: ['In Progress'] });
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      // Arrange
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      model.settings = { swim1: { limit: 5, columns: [] } };
      model.state = 'loaded';
      model.error = 'Some error';

      // Act
      model.reset();

      // Assert
      expect(model.settings).toEqual({});
      expect(model.state).toBe('initial');
      expect(model.error).toBeNull();
    });
  });
});
