import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PropertyModel } from './PropertyModel';
import type { BoardPropertyServiceI } from 'src/infrastructure/jira/boardPropertyService';
import type { Logger } from 'src/infrastructure/logging/Logger';

describe('PropertyModel', () => {
  let model: PropertyModel;
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

    model = new PropertyModel(mockBoardPropertyService, mockLogger);
  });

  describe('initial state', () => {
    it('should have initial state', () => {
      expect(model.settings).toEqual({ enabled: false });
      expect(model.state).toBe('initial');
      expect(model.error).toBeNull();
    });
  });

  describe('load', () => {
    it('should load settings when property exists', async () => {
      const mockSettings = { value: true };
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockResolvedValue(mockSettings);

      const result = await model.load();

      expect(result.err).toBe(false);
      expect(result.val).toEqual({ enabled: true });
      expect(model.settings).toEqual({ enabled: true });
      expect(model.state).toBe('loaded');
      expect(model.error).toBeNull();
      expect(mockBoardPropertyService.getBoardProperty).toHaveBeenCalledWith('card-colors');
    });

    it('should load default settings when property does not exist', async () => {
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockResolvedValue(undefined);

      const result = await model.load();

      expect(result.err).toBe(false);
      expect(result.val).toEqual({ enabled: false });
      expect(model.settings).toEqual({ enabled: false });
      expect(model.state).toBe('loaded');
    });

    it('should handle load errors', async () => {
      const error = new Error('Failed to load');
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockRejectedValue(error);

      const result = await model.load();

      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect(model.state).toBe('error');
      expect(model.error).toBe('Failed to load');
    });

    it('should skip loading when already loading', async () => {
      const mockSettings = { value: true };
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockResolvedValue(mockSettings);

      // First load
      await model.load();
      expect(mockBoardPropertyService.getBoardProperty).toHaveBeenCalledTimes(1);

      // Change state to loading
      model.state = 'loading';

      // Second load should skip
      const result = await model.load();

      expect(result.err).toBe(false);
      expect(result.val).toEqual({ enabled: true });
      expect(mockBoardPropertyService.getBoardProperty).toHaveBeenCalledTimes(1);
    });
  });

  describe('save', () => {
    it('should save settings', async () => {
      vi.mocked(mockBoardPropertyService.updateBoardProperty).mockResolvedValue();

      const settings = { enabled: true };
      const result = await model.save(settings);

      expect(result.err).toBe(false);
      expect(model.settings).toEqual(settings);
      expect(mockBoardPropertyService.updateBoardProperty).toHaveBeenCalledWith('card-colors', { value: true }, {});
    });

    it('should handle save errors', async () => {
      const error = new Error('Failed to save');
      vi.mocked(mockBoardPropertyService.updateBoardProperty).mockRejectedValue(error);

      const settings = { enabled: true };
      const result = await model.save(settings);

      expect(result.err).toBe(true);
      expect(result.val).toBeInstanceOf(Error);
      expect(model.settings).toEqual({ enabled: false }); // Should not change on error
    });
  });

  describe('setEnabled', () => {
    it('should update enabled state', () => {
      model.setEnabled(true);
      expect(model.settings.enabled).toBe(true);

      model.setEnabled(false);
      expect(model.settings.enabled).toBe(false);
    });
  });

  describe('isEnabled', () => {
    it('should return current enabled state', () => {
      expect(model.isEnabled()).toBe(false);

      model.settings.enabled = true;
      expect(model.isEnabled()).toBe(true);
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      model.settings = { enabled: true };
      model.state = 'loaded';
      model.error = 'Some error';

      model.reset();

      expect(model.settings).toEqual({ enabled: false });
      expect(model.state).toBe('initial');
      expect(model.error).toBeNull();
    });
  });
});
