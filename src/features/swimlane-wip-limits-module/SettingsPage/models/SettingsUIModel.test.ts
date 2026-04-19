import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsUIModel } from './SettingsUIModel';
import type { PropertyModel } from '../../property/PropertyModel';
import type { Logger } from 'src/shared/Logger';
import type { SwimlaneSettings, Swimlane, BoardData } from '../../types';
import { Ok, Err } from 'ts-results';

describe('SettingsUIModel', () => {
  let mockPropertyModel: PropertyModel;
  let mockGetBoardEditData: () => Promise<BoardData>;
  let mockLogger: Logger;

  const mockSwimlanes: Swimlane[] = [
    { id: 'swim1', name: 'Swimlane 1' },
    { id: 'swim2', name: 'Swimlane 2' },
  ];

  const mockBoardData: BoardData = {
    canEdit: true,
    swimlanesConfig: { swimlanes: mockSwimlanes },
  };

  const mockSettings: SwimlaneSettings = {
    swim1: { limit: 5, columns: [] },
  };

  beforeEach(() => {
    mockPropertyModel = {
      settings: { ...mockSettings },
      load: vi.fn().mockImplementation(async () => {
        mockPropertyModel.settings = { ...mockSettings };
        return Ok(mockSettings);
      }),
      save: vi.fn().mockResolvedValue(Ok(undefined)),
    } as unknown as PropertyModel;

    mockGetBoardEditData = vi.fn().mockResolvedValue(mockBoardData);

    mockLogger = {
      getPrefixedLog: vi.fn(() => vi.fn()),
    } as unknown as Logger;
  });

  describe('open', () => {
    it('should load settings and board data', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);

      const result = await model.open();

      expect(result.ok).toBe(true);
      expect(model.isOpen).toBe(true);
      expect(model.draft).toEqual(mockSettings);
      expect(model.swimlanes).toEqual(mockSwimlanes);
      expect(model.isLoading).toBe(false);
      expect(model.error).toBeNull();
      expect(mockPropertyModel.load).toHaveBeenCalled();
      expect(mockGetBoardEditData).toHaveBeenCalled();
    });

    it('should set swimlanes from board data', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);

      await model.open();

      expect(model.swimlanes).toEqual(mockSwimlanes);
      expect(model.editingSwimlaneId).toBeNull();
    });

    it('should return error if settings fail to load', async () => {
      const loadError = new Error('Load failed');
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Err(loadError));

      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);

      const result = await model.open();

      expect(result.err).toBe(true);
      expect(result.val).toEqual(loadError);
      expect(model.error).toBe('Load failed');
      expect(model.isOpen).toBe(true); // modal stays open to show error
      expect(model.isLoading).toBe(false);
    });

    it('should return error if board data fails to load', async () => {
      const boardError = new Error('Board fetch failed');
      vi.mocked(mockGetBoardEditData).mockRejectedValue(boardError);

      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);

      const result = await model.open();

      expect(result.err).toBe(true);
      expect(model.error).toBe('Board fetch failed');
      expect(model.isOpen).toBe(true); // modal stays open to show error
      expect(model.isLoading).toBe(false);
    });
  });

  describe('save', () => {
    it('should save draft to property model', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();
      model.updateDraft('swim1', { limit: 10 });

      const result = await model.save();

      expect(result.ok).toBe(true);
      expect(mockPropertyModel.save).toHaveBeenCalledWith(
        expect.objectContaining({ swim1: expect.objectContaining({ limit: 10 }) })
      );
    });

    it('should close modal on success', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();

      await model.save();

      expect(model.isOpen).toBe(false);
      expect(model.draft).toEqual({});
      expect(model.swimlanes).toEqual([]);
      expect(model.isSaving).toBe(false);
    });

    it('should keep modal open and show error on failure', async () => {
      const saveError = new Error('Save failed');
      vi.mocked(mockPropertyModel.save).mockResolvedValue(Err(saveError));

      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();
      model.updateDraft('swim1', { limit: 10 });

      const result = await model.save();

      expect(result.err).toBe(true);
      expect(model.isOpen).toBe(true);
      expect(model.error).toBe('Save failed');
      expect(model.isSaving).toBe(false);
      expect(model.draft).toEqual(expect.objectContaining({ swim1: expect.anything() }));
    });
  });

  describe('close', () => {
    it('should reset all state', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();
      model.updateDraft('swim1', { limit: 99 });
      model.setEditingSwimlaneId('swim1');

      model.close();

      expect(model.isOpen).toBe(false);
      expect(model.draft).toEqual({});
      expect(model.swimlanes).toEqual([]);
      expect(model.editingSwimlaneId).toBeNull();
      expect(model.error).toBeNull();
      expect(model.isSaving).toBe(false);
      expect(model.isLoading).toBe(false);
    });
  });

  describe('updateDraft', () => {
    it('should update existing swimlane settings', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();

      model.updateDraft('swim1', { limit: 10 });

      expect(model.draft.swim1).toEqual({ limit: 10, columns: [] });
    });

    it('should create settings for new swimlane', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();

      model.updateDraft('swim2', { limit: 3, columns: ['In Progress'] });

      expect(model.draft.swim2).toEqual({ limit: 3, columns: ['In Progress'] });
    });
  });

  describe('setEditingSwimlaneId', () => {
    it('should set editing swimlane id', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();

      model.setEditingSwimlaneId('swim1');
      expect(model.editingSwimlaneId).toBe('swim1');

      model.setEditingSwimlaneId(null);
      expect(model.editingSwimlaneId).toBeNull();
    });
  });

  describe('reset', () => {
    it('should call close', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();

      model.reset();

      expect(model.isOpen).toBe(false);
      expect(model.draft).toEqual({});
    });
  });

  describe('hasUnsavedChanges', () => {
    it('should return false when draft equals property settings', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();

      expect(model.hasUnsavedChanges).toBe(false);
    });

    it('should return true when draft differs from property settings', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();
      model.updateDraft('swim1', { limit: 99 });

      expect(model.hasUnsavedChanges).toBe(true);
    });
  });
});
