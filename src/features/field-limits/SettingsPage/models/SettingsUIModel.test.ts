import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsUIModel } from './SettingsUIModel';
import type { PropertyModel } from '../../property/PropertyModel';
import type { Logger } from 'src/shared/Logger';
import type {
  FieldLimitsSettings,
  LimitFormInput,
  BoardEditData,
  BoardColumn,
  BoardSwimlane,
  CardLayoutField,
} from '../../types';
import { CalcType } from '../../types';
import { Ok, Err } from 'ts-results';

vi.mock('../../utils/createLimitKey', () => ({
  createLimitKey: vi.fn(() => 'mocked-limit-key'),
}));

describe('SettingsUIModel', () => {
  let mockPropertyModel: PropertyModel;
  let mockGetBoardEditData: () => Promise<BoardEditData>;
  let mockLogger: Logger;

  const mockCardLayoutFields: CardLayoutField[] = [
    { fieldId: 'priority', name: 'Priority' },
    { fieldId: 'team', name: 'Team' },
  ];

  const mockColumns: BoardColumn[] = [
    { id: 'col1', name: 'To Do' },
    { id: 'col2', name: 'In Progress' },
  ];

  const mockSwimlanes: BoardSwimlane[] = [{ id: 'swim1', name: 'Swimlane 1' }];

  const mockBoardEditData: BoardEditData = {
    canEdit: true,
    rapidListConfig: {
      mappedColumns: [
        { id: 'col1', name: 'To Do', isKanPlanColumn: false },
        { id: 'col2', name: 'In Progress', isKanPlanColumn: false },
        { id: 'kanplan', name: 'Backlog', isKanPlanColumn: true },
      ],
    },
    swimlanesConfig: {
      swimlanes: mockSwimlanes,
    },
    cardLayoutConfig: {
      currentFields: mockCardLayoutFields,
    },
  };

  const mockSettings: FieldLimitsSettings = {
    limits: {
      key1: {
        calcType: CalcType.EXACT_VALUE,
        fieldValue: 'High',
        fieldId: 'priority',
        limit: 5,
        columns: ['col1'],
        swimlanes: ['swim1'],
        visualValue: 'High',
      },
    },
  };

  const mockLimitFormInput: LimitFormInput = {
    calcType: CalcType.EXACT_VALUE,
    fieldId: 'priority',
    fieldValue: 'Medium',
    visualValue: 'Medium',
    limit: 3,
    columns: ['col1', 'col2'],
    swimlanes: ['swim1'],
  };

  beforeEach(() => {
    mockPropertyModel = {
      settings: { limits: {} } as FieldLimitsSettings,
      load: vi.fn().mockResolvedValue(Ok({ limits: {} })),
      save: vi.fn().mockResolvedValue(Ok(undefined)),
    } as unknown as PropertyModel;

    mockGetBoardEditData = vi.fn().mockResolvedValue(mockBoardEditData);

    mockLogger = {
      getPrefixedLog: vi.fn(() => vi.fn()),
    } as unknown as Logger;

    vi.clearAllMocks();
  });

  describe('open', () => {
    it('should load settings and board data, extract cardLayoutFields, columns, swimlanes', async () => {
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Ok(mockSettings));

      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);

      const result = await model.open();

      expect(result.ok).toBe(true);
      expect(model.isOpen).toBe(true);
      expect(model.draft).toEqual(mockSettings);
      expect(model.cardLayoutFields).toEqual(mockCardLayoutFields);
      expect(model.columns).toEqual(mockColumns);
      expect(model.swimlanes).toEqual(mockSwimlanes);
      expect(model.isLoading).toBe(false);
      expect(model.error).toBeNull();
      expect(model.editingLimitKey).toBeNull();
      expect(mockPropertyModel.load).toHaveBeenCalled();
      expect(mockGetBoardEditData).toHaveBeenCalled();
    });

    it('should filter out KanPlan columns', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);

      await model.open();

      expect(model.columns).toEqual(mockColumns);
      expect(model.columns.some(col => col.id === 'kanplan')).toBe(false);
    });

    it('should return error if settings fail to load', async () => {
      const loadError = new Error('Load failed');
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Err(loadError));

      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);

      const result = await model.open();

      expect(result.err).toBe(true);
      expect(result.val).toEqual(loadError);
      expect(model.error).toBe('Load failed');
      expect(model.isOpen).toBe(true);
      expect(model.isLoading).toBe(false);
    });

    it('should return error if board data fails to load', async () => {
      const boardError = new Error('Board fetch failed');
      vi.mocked(mockGetBoardEditData).mockRejectedValue(boardError);

      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);

      const result = await model.open();

      expect(result.err).toBe(true);
      expect(model.error).toBe('Board fetch failed');
      expect(model.isOpen).toBe(true);
      expect(model.isLoading).toBe(false);
    });
  });

  describe('save', () => {
    it('should save draft to property model', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();
      model.addLimit(mockLimitFormInput);
      const draftBeforeSave = JSON.parse(JSON.stringify(model.draft));

      const result = await model.save();

      expect(result.ok).toBe(true);
      expect(mockPropertyModel.save).toHaveBeenCalledWith(draftBeforeSave);
    });

    it('should close modal on success', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();

      await model.save();

      expect(model.isOpen).toBe(false);
      expect(model.draft).toEqual({ limits: {} });
      expect(model.cardLayoutFields).toEqual([]);
      expect(model.columns).toEqual([]);
      expect(model.swimlanes).toEqual([]);
      expect(model.isSaving).toBe(false);
    });

    it('should keep modal open and show error on failure', async () => {
      const saveError = new Error('Save failed');
      vi.mocked(mockPropertyModel.save).mockResolvedValue(Err(saveError));

      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();
      model.addLimit(mockLimitFormInput);

      const result = await model.save();

      expect(result.err).toBe(true);
      expect(model.isOpen).toBe(true);
      expect(model.error).toBe('Save failed');
      expect(model.isSaving).toBe(false);
      expect(Object.keys(model.draft.limits)).toHaveLength(1);
    });
  });

  describe('close', () => {
    it('should reset all state', async () => {
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Ok(mockSettings));
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();
      model.addLimit(mockLimitFormInput);
      model.setEditingLimitKey('key1');

      model.close();

      expect(model.isOpen).toBe(false);
      expect(model.draft).toEqual({ limits: {} });
      expect(model.cardLayoutFields).toEqual([]);
      expect(model.columns).toEqual([]);
      expect(model.swimlanes).toEqual([]);
      expect(model.editingLimitKey).toBeNull();
      expect(model.error).toBeNull();
      expect(model.isSaving).toBe(false);
      expect(model.isLoading).toBe(false);
    });
  });

  describe('addLimit', () => {
    it('should add limit with generated key', async () => {
      const { createLimitKey } = await import('../../utils/createLimitKey');
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();

      model.addLimit(mockLimitFormInput);

      expect(createLimitKey).toHaveBeenCalledWith({
        fieldValue: mockLimitFormInput.fieldValue,
        fieldId: mockLimitFormInput.fieldId,
      });
      expect(model.draft.limits['mocked-limit-key']).toEqual({
        calcType: mockLimitFormInput.calcType,
        fieldValue: mockLimitFormInput.fieldValue,
        fieldId: mockLimitFormInput.fieldId,
        limit: mockLimitFormInput.limit,
        columns: mockLimitFormInput.columns,
        swimlanes: mockLimitFormInput.swimlanes,
        visualValue: mockLimitFormInput.visualValue,
      });
    });
  });

  describe('updateLimit', () => {
    it('should update existing limit', async () => {
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Ok(mockSettings));
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();

      const updatedInput: LimitFormInput = {
        ...mockLimitFormInput,
        limit: 10,
        visualValue: 'Updated',
      };
      model.updateLimit('key1', updatedInput);

      expect(model.draft.limits['key1']).toEqual({
        ...mockSettings.limits['key1'],
        calcType: updatedInput.calcType,
        fieldValue: updatedInput.fieldValue,
        fieldId: updatedInput.fieldId,
        limit: 10,
        columns: updatedInput.columns,
        swimlanes: updatedInput.swimlanes,
        visualValue: 'Updated',
      });
    });

    it('should do nothing if limit key does not exist', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();
      model.draft = { limits: { key1: mockSettings.limits['key1'] } };

      model.updateLimit('nonexistent', mockLimitFormInput);

      expect(model.draft.limits['key1']).toEqual(mockSettings.limits['key1']);
      expect(model.draft.limits['nonexistent']).toBeUndefined();
    });
  });

  describe('deleteLimit', () => {
    it('should remove limit from draft', async () => {
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Ok(mockSettings));
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();

      model.deleteLimit('key1');

      expect(model.draft.limits['key1']).toBeUndefined();
      expect(Object.keys(model.draft.limits)).toHaveLength(0);
    });
  });

  describe('setEditingLimitKey', () => {
    it('should set and clear editing limit key', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();

      model.setEditingLimitKey('key1');
      expect(model.editingLimitKey).toBe('key1');

      model.setEditingLimitKey(null);
      expect(model.editingLimitKey).toBeNull();
    });
  });

  describe('setLimitColor', () => {
    it('should update limit color', async () => {
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Ok(mockSettings));
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();

      model.setLimitColor('key1', '#ff0000');

      expect(model.draft.limits['key1'].bkgColor).toBe('#ff0000');
    });

    it('should do nothing if limit key does not exist', async () => {
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();

      model.setLimitColor('nonexistent', '#ff0000');

      expect(model.draft.limits['nonexistent']).toBeUndefined();
    });
  });

  describe('hasUnsavedChanges', () => {
    it('should return false when draft equals property settings', async () => {
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Ok(mockSettings));
      mockPropertyModel.settings = JSON.parse(JSON.stringify(mockSettings));
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();

      expect(model.hasUnsavedChanges).toBe(false);
    });

    it('should return true when draft differs from property settings', async () => {
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Ok(mockSettings));
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();
      model.addLimit(mockLimitFormInput);

      expect(model.hasUnsavedChanges).toBe(true);
    });
  });

  describe('reset', () => {
    it('should call close', async () => {
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Ok(mockSettings));
      const model = new SettingsUIModel(mockPropertyModel, mockGetBoardEditData, mockLogger);
      await model.open();

      model.reset();

      expect(model.isOpen).toBe(false);
      expect(model.draft).toEqual({ limits: {} });
    });
  });
});
