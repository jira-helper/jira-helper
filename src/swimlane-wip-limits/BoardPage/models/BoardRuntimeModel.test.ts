import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BoardRuntimeModel } from './BoardRuntimeModel';
import type { PropertyModel } from '../../property/PropertyModel';
import type { IBoardPagePageObject, SwimlaneElement } from 'src/page-objects/BoardPage';
import type { Logger } from 'src/shared/Logger';
import type { SwimlaneSettings, SwimlaneSetting, SwimlaneIssueStats } from '../../types';
import { Ok, Err } from 'ts-results';

describe('BoardRuntimeModel', () => {
  let mockPropertyModel: PropertyModel;
  let mockPageObject: IBoardPagePageObject;
  let mockLogger: Logger;

  beforeEach(() => {
    mockPropertyModel = {
      load: vi.fn().mockResolvedValue(Ok({})),
      settings: {},
    } as unknown as PropertyModel;

    mockPageObject = {
      getColumns: vi.fn().mockReturnValue(['To Do', 'In Progress', 'Done']),
      getSwimlanes: vi.fn().mockReturnValue([]),
      getSwimlaneHeader: vi.fn().mockReturnValue(null),
      getIssueCountForColumns: vi.fn().mockReturnValue(0),
      getIssueCountByColumn: vi.fn().mockReturnValue([]),
      removeSwimlaneComponent: vi.fn(),
    } as unknown as IBoardPagePageObject;

    mockLogger = {
      getPrefixedLog: vi.fn(() => vi.fn()),
    } as unknown as Logger;
  });

  describe('initialize', () => {
    it('should load settings and set isInitialized', async () => {
      // Arrange
      const settings: SwimlaneSettings = { swim1: { limit: 5, columns: [] } };
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Ok(settings));

      const model = new BoardRuntimeModel(mockPropertyModel, mockPageObject, mockLogger);

      // Act
      const result = await model.initialize();

      // Assert
      expect(result.ok).toBe(true);
      expect(model.settings).toEqual(settings);
      expect(model.columnNames).toEqual(['To Do', 'In Progress', 'Done']);
      expect(model.isInitialized).toBe(true);
      expect(mockPropertyModel.load).toHaveBeenCalledOnce();
    });

    it('should return error if property model fails', async () => {
      // Arrange
      const error = new Error('Load failed');
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Err(error));

      const model = new BoardRuntimeModel(mockPropertyModel, mockPageObject, mockLogger);

      // Act
      const result = await model.initialize();

      // Assert
      expect(result.err).toBe(true);
      expect(result.val).toEqual(error);
      expect(model.isInitialized).toBe(false);
    });
  });

  describe('calculateStats', () => {
    it('should use all columns when setting.columns is empty', () => {
      // Arrange
      const model = new BoardRuntimeModel(mockPropertyModel, mockPageObject, mockLogger);
      model.columnNames = ['To Do', 'In Progress', 'Done'];
      vi.mocked(mockPageObject.getColumns).mockReturnValue(['To Do', 'In Progress', 'Done']);
      vi.mocked(mockPageObject.getIssueCountForColumns).mockReturnValue(3);
      vi.mocked(mockPageObject.getIssueCountByColumn).mockReturnValue([1, 2, 0]);

      const setting: SwimlaneSetting = { limit: 5, columns: [] };

      // Act
      const stats = model.calculateStats('swim1', setting);

      // Assert
      expect(mockPageObject.getIssueCountForColumns).toHaveBeenCalledWith('swim1', ['To Do', 'In Progress', 'Done'], {
        excludeDone: true,
        excludeSubtasks: true,
      });
      expect(stats.count).toBe(3);
      expect(stats.columnCounts).toEqual([1, 2, 0]);
      expect(stats.isOverLimit).toBe(false);
    });

    it('should use specified columns when setting.columns is not empty', () => {
      // Arrange
      const model = new BoardRuntimeModel(mockPropertyModel, mockPageObject, mockLogger);
      vi.mocked(mockPageObject.getIssueCountForColumns).mockReturnValue(2);
      vi.mocked(mockPageObject.getIssueCountByColumn).mockReturnValue([1, 2, 0]);

      const setting: SwimlaneSetting = { limit: 5, columns: ['In Progress', 'Done'] };

      // Act
      const stats = model.calculateStats('swim1', setting);

      // Assert
      expect(mockPageObject.getIssueCountForColumns).toHaveBeenCalledWith('swim1', ['In Progress', 'Done'], {
        excludeDone: true,
        excludeSubtasks: true,
      });
      expect(stats.count).toBe(2);
    });

    it('should return isOverLimit=true when count > limit', () => {
      // Arrange
      const model = new BoardRuntimeModel(mockPropertyModel, mockPageObject, mockLogger);
      vi.mocked(mockPageObject.getIssueCountForColumns).mockReturnValue(6);
      vi.mocked(mockPageObject.getIssueCountByColumn).mockReturnValue([2, 4, 0]);

      const setting: SwimlaneSetting = { limit: 5, columns: [] };

      // Act
      const stats = model.calculateStats('swim1', setting);

      // Assert
      expect(stats.isOverLimit).toBe(true);
    });

    it('should return isOverLimit=false when count <= limit', () => {
      // Arrange
      const model = new BoardRuntimeModel(mockPropertyModel, mockPageObject, mockLogger);
      vi.mocked(mockPageObject.getIssueCountForColumns).mockReturnValue(5);
      vi.mocked(mockPageObject.getIssueCountByColumn).mockReturnValue([2, 3, 0]);

      const setting: SwimlaneSetting = { limit: 5, columns: [] };

      // Act
      const stats = model.calculateStats('swim1', setting);

      // Assert
      expect(stats.isOverLimit).toBe(false);
    });
  });

  describe('render', () => {
    it('should calculate stats for swimlanes with limits', () => {
      // Arrange
      const swimlanes: SwimlaneElement[] = [
        { id: 'swim1', element: document.createElement('div'), header: document.createElement('div') },
        { id: 'swim2', element: document.createElement('div'), header: document.createElement('div') },
      ];
      vi.mocked(mockPageObject.getSwimlanes).mockReturnValue(swimlanes);
      vi.mocked(mockPageObject.getIssueCountForColumns).mockImplementation((id: string) => (id === 'swim1' ? 3 : 7));
      vi.mocked(mockPageObject.getIssueCountByColumn).mockReturnValue([1, 2, 0]);

      const model = new BoardRuntimeModel(mockPropertyModel, mockPageObject, mockLogger);
      model.settings = {
        swim1: { limit: 5, columns: [] },
        swim2: { limit: 5, columns: [] },
      };

      // Act
      model.render();

      // Assert
      expect(model.stats.swim1).toEqual({
        count: 3,
        columnCounts: [1, 2, 0],
        isOverLimit: false,
      });
      expect(model.stats.swim2).toEqual({
        count: 7,
        columnCounts: [1, 2, 0],
        isOverLimit: true,
      });
    });

    it('should skip swimlanes without limits', () => {
      // Arrange
      const swimlanes: SwimlaneElement[] = [
        { id: 'swim1', element: document.createElement('div'), header: document.createElement('div') },
      ];
      vi.mocked(mockPageObject.getSwimlanes).mockReturnValue(swimlanes);

      const model = new BoardRuntimeModel(mockPropertyModel, mockPageObject, mockLogger);
      model.settings = {
        swim1: { columns: [] }, // no limit
      };

      // Act
      model.render();

      // Assert
      expect(model.stats).toEqual({});
      expect(mockPageObject.getIssueCountForColumns).not.toHaveBeenCalled();
    });
  });

  describe('queries', () => {
    it('getSwimlaneStats should return stats by id', () => {
      // Arrange
      const model = new BoardRuntimeModel(mockPropertyModel, mockPageObject, mockLogger);
      const expectedStats: SwimlaneIssueStats = {
        count: 3,
        columnCounts: [1, 2, 0],
        isOverLimit: false,
      };
      model.stats = { swim1: expectedStats };

      // Act
      const result = model.getSwimlaneStats('swim1');

      // Assert
      expect(result).toEqual(expectedStats);
      expect(model.getSwimlaneStats('unknown')).toBeUndefined();
    });

    it('isOverLimit should return true when exceeded', () => {
      // Arrange
      const model = new BoardRuntimeModel(mockPropertyModel, mockPageObject, mockLogger);
      model.stats = { swim1: { count: 6, columnCounts: [], isOverLimit: true } };
      model.settings = { swim1: { limit: 5, columns: [] } };

      // Act & Assert
      expect(model.isOverLimit('swim1')).toBe(true);
      expect(model.isOverLimit('unknown')).toBe(false);
    });

    it('getBadgeText should return "count/limit" format', () => {
      // Arrange
      const model = new BoardRuntimeModel(mockPropertyModel, mockPageObject, mockLogger);
      model.stats = { swim1: { count: 3, columnCounts: [], isOverLimit: false } };
      model.settings = { swim1: { limit: 5, columns: [] } };

      // Act & Assert
      expect(model.getBadgeText('swim1')).toBe('3/5');
      expect(model.getBadgeText('unknown')).toBeNull();
      expect(model.getBadgeText('swim2')).toBeNull();
    });
  });

  describe('destroy', () => {
    it('should remove components and reset state', () => {
      // Arrange
      const header = document.createElement('div');
      const swimlanes: SwimlaneElement[] = [{ id: 'swim1', element: document.createElement('div'), header }];
      vi.mocked(mockPageObject.getSwimlanes).mockReturnValue(swimlanes);
      vi.mocked(mockPageObject.getSwimlaneHeader).mockReturnValue(header);

      const model = new BoardRuntimeModel(mockPropertyModel, mockPageObject, mockLogger);
      model.settings = { swim1: { limit: 5, columns: [] } };
      model.stats = { swim1: { count: 3, columnCounts: [], isOverLimit: false } };
      model.isInitialized = true;

      // Act
      model.destroy();

      // Assert
      expect(mockPageObject.removeSwimlaneComponent).toHaveBeenCalledWith(header, 'swimlane-limit-badge');
      expect(model.settings).toEqual({});
      expect(model.stats).toEqual({});
      expect(model.columnNames).toEqual([]);
      expect(model.isInitialized).toBe(false);
    });
  });
});
