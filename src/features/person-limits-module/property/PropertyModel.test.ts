import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PropertyModel } from './PropertyModel';
import type { BoardPropertyServiceI } from 'src/infrastructure/jira/boardPropertyService';
import type { Logger } from 'src/infrastructure/logging/Logger';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import type { PersonLimit, PersonWipLimitsProperty, PersonWipLimitsProperty_2_29 } from './types';

describe('person-limits PropertyModel', () => {
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
    it('should apply migration when loading v2.29 property from API', async () => {
      const v29: PersonWipLimitsProperty_2_29 = {
        limits: [
          {
            id: 1,
            person: { name: 'john', self: 'https://jira/user' },
            limit: 3,
            columns: [],
            swimlanes: [],
          },
        ],
      };
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockResolvedValueOnce(v29);
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);

      const result = await model.load();

      expect(result.ok).toBe(true);
      expect(result.ok && result.val.limits[0]?.showAllPersonIssues).toBe(true);
      expect(model.data.limits[0]?.showAllPersonIssues).toBe(true);
      expect(model.state).toBe('loaded');
      expect(model.error).toBeNull();
      expect(mockBoardPropertyService.getBoardProperty).toHaveBeenCalledWith(BOARD_PROPERTIES.PERSON_LIMITS);
    });

    it('should normalize undefined API result to migrated empty property', async () => {
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockResolvedValueOnce(undefined);
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);

      const result = await model.load();

      expect(result.ok).toBe(true);
      expect(model.data).toEqual({ limits: [] });
      expect(model.state).toBe('loaded');
    });

    it('should treat missing board id as empty loaded state', async () => {
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockRejectedValueOnce(new Error('no board id'));
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);

      const result = await model.load();

      expect(result.ok).toBe(true);
      expect(model.data).toEqual({ limits: [] });
      expect(model.state).toBe('loaded');
      expect(model.error).toBeNull();
    });

    it('should set error and return Err when load fails', async () => {
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockRejectedValueOnce(new Error('Network error'));
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);

      const result = await model.load();

      expect(result.err).toBe(true);
      expect(model.state).toBe('initial');
      expect(model.error).toBe('Network error');
    });

    it('should skip load when state is not initial (loaded)', async () => {
      const data: PersonWipLimitsProperty = {
        limits: [
          { id: 1, person: { name: 'a', self: 's' }, limit: 1, columns: [], swimlanes: [], showAllPersonIssues: true },
        ],
      };
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockResolvedValueOnce(data);
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      await model.load();
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockClear();

      const result = await model.load();

      expect(result.ok).toBe(true);
      expect(result.val).toEqual(model.data);
      expect(mockBoardPropertyService.getBoardProperty).not.toHaveBeenCalled();
    });

    it('should skip second load while already loading', async () => {
      let resolveFirst: (value: PersonWipLimitsProperty | undefined) => void;
      const firstPromise = new Promise<PersonWipLimitsProperty | undefined>(resolve => {
        resolveFirst = resolve;
      });
      vi.mocked(mockBoardPropertyService.getBoardProperty).mockImplementation(
        () => firstPromise as Promise<PersonWipLimitsProperty | undefined>
      );
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);

      const load1Promise = model.load();
      await new Promise(r => setTimeout(r, 0));
      const load2Promise = model.load();

      resolveFirst!({ limits: [] });
      const [load1, load2] = await Promise.all([load1Promise, load2Promise]);

      expect(mockBoardPropertyService.getBoardProperty).toHaveBeenCalledTimes(1);
      expect(load1.ok).toBe(true);
      expect(load2.ok).toBe(true);
    });
  });

  describe('persist', () => {
    it('should save current data with PERSON_LIMITS key', async () => {
      const limits: PersonLimit[] = [
        { id: 1, person: { name: 'x', self: 'y' }, limit: 2, columns: [], swimlanes: [], showAllPersonIssues: false },
      ];
      const data: PersonWipLimitsProperty = { limits };
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      model.setData(data);

      const result = await model.persist();

      expect(result.ok).toBe(true);
      expect(mockBoardPropertyService.updateBoardProperty).toHaveBeenCalledWith(
        BOARD_PROPERTIES.PERSON_LIMITS,
        data,
        {}
      );
    });

    it('should return Err when persist fails', async () => {
      const error = new Error('no board id');
      vi.mocked(mockBoardPropertyService.updateBoardProperty).mockImplementation(() => {
        throw error;
      });
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      model.setData({ limits: [] });

      const result = await model.persist();

      expect(result.err).toBe(true);
      expect(result.val).toEqual(error);
    });
  });

  describe('setData', () => {
    it('should migrate v2.29 data and set state to loaded', () => {
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      const raw: PersonWipLimitsProperty_2_29 = {
        limits: [
          {
            id: 7,
            person: { name: 'jane', self: 'z' },
            limit: 1,
            columns: [],
            swimlanes: [],
          },
        ],
      };

      model.setData(raw);

      expect(model.data.limits[0]?.showAllPersonIssues).toBe(true);
      expect(model.state).toBe('loaded');
    });
  });

  describe('setLimits', () => {
    it('should replace limits only', () => {
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      const next: PersonLimit[] = [
        { id: 2, person: { name: 'b', self: 'c' }, limit: 9, columns: [], swimlanes: [], showAllPersonIssues: true },
      ];

      model.setLimits(next);

      expect(model.data.limits).toEqual(next);
    });
  });

  describe('reset', () => {
    it('should reset data, state and error', () => {
      const model = new PropertyModel(mockBoardPropertyService, mockLogger);
      model.setData({
        limits: [
          {
            id: 1,
            person: { name: 'p', self: 'q' },
            limit: 1,
            columns: [],
            swimlanes: [],
            showAllPersonIssues: true,
          },
        ],
      });
      model.error = 'x';

      model.reset();

      expect(model.data).toEqual({ limits: [] });
      expect(model.state).toBe('initial');
      expect(model.error).toBeNull();
    });
  });
});
