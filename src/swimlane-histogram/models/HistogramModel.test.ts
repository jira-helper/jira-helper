import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HistogramModel } from './HistogramModel';
import { BoardPagePageObjectMock } from 'src/page-objects/BoardPage.mock';
import type { IBoardPagePageObject, SwimlaneElement } from 'src/page-objects/BoardPage';
import { Logger } from 'src/shared/Logger';

describe('HistogramModel', () => {
  let model: HistogramModel;
  let mockPageObject: IBoardPagePageObject;

  beforeEach(() => {
    mockPageObject = {
      ...BoardPagePageObjectMock,
      getSwimlanes: vi.fn().mockReturnValue([
        { id: 'sw-1', element: {}, header: {} },
        { id: 'sw-2', element: {}, header: {} },
      ] as SwimlaneElement[]),
      getColumns: vi.fn().mockReturnValue(['To Do', 'In Progress', 'Done']),
      getIssueCountByColumn: vi.fn().mockReturnValue([5, 3, 2]),
    } as unknown as IBoardPagePageObject;

    model = new HistogramModel(mockPageObject, new Logger());
  });

  describe('initialize', () => {
    it('should calculate histograms for all swimlanes', () => {
      model.initialize();

      expect(model.state).toBe('loaded');
      expect(model.histograms.size).toBe(2);
    });

    it('should handle errors', () => {
      vi.mocked(mockPageObject.getSwimlanes).mockImplementation(() => {
        throw new Error('DOM error');
      });

      model.initialize();

      expect(model.state).toBe('error');
      expect(model.error).toBe('DOM error');
    });
  });

  describe('calculateHistogram', () => {
    it('should return correct histogram data', () => {
      const histogram = model.calculateHistogram('sw-1', ['To Do', 'In Progress', 'Done']);

      expect(histogram.swimlaneId).toBe('sw-1');
      expect(histogram.totalIssues).toBe(10);
      expect(histogram.columns).toHaveLength(3);
      expect(histogram.columns[0]).toEqual({ columnName: 'To Do', issueCount: 5 });
    });
  });

  describe('getHistogram', () => {
    it('should return histogram by swimlaneId', () => {
      model.initialize();

      const histogram = model.getHistogram('sw-1');

      expect(histogram).toBeDefined();
      expect(histogram?.swimlaneId).toBe('sw-1');
    });

    it('should return undefined for unknown swimlane', () => {
      model.initialize();

      expect(model.getHistogram('unknown')).toBeUndefined();
    });
  });

  describe('refresh', () => {
    it('should recalculate histograms', () => {
      model.initialize();

      vi.mocked(mockPageObject.getIssueCountByColumn).mockReturnValue([10, 5, 1]);
      model.refresh();

      const histogram = model.getHistogram('sw-1');
      expect(histogram?.totalIssues).toBe(16);
    });
  });

  describe('dispose', () => {
    it('should clear histograms and reset state', () => {
      model.initialize();
      model.dispose();

      expect(model.histograms.size).toBe(0);
      expect(model.state).toBe('initial');
      expect(model.error).toBeNull();
    });
  });
});
