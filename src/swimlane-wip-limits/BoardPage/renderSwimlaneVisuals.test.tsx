import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { IBoardPagePageObject, SwimlaneElement } from 'src/page-objects/BoardPage';
import type { BoardRuntimeModel } from './models/BoardRuntimeModel';
import { renderSwimlaneVisuals } from './renderSwimlaneVisuals';

const createMockPageObject = () => ({
  getSwimlanes: vi.fn<() => SwimlaneElement[]>(),
  removeSwimlaneComponent: vi.fn(),
  insertSwimlaneComponent: vi.fn(),
  highlightSwimlane: vi.fn(),
});

const createMockModel = (overrides = {}) =>
  ({
    settings: {},
    stats: {},
    getSwimlaneStats: vi.fn(),
    ...overrides,
  }) as unknown as BoardRuntimeModel;

const makeSwimlane = (id: string): SwimlaneElement => ({
  id,
  element: document.createElement('div'),
  header: document.createElement('div'),
});

describe('renderSwimlaneVisuals', () => {
  let pageObject: ReturnType<typeof createMockPageObject>;

  beforeEach(() => {
    pageObject = createMockPageObject();
  });

  it('should insert LimitBadge for swimlane with stats', () => {
    const sw1 = makeSwimlane('sw1');
    pageObject.getSwimlanes.mockReturnValue([sw1]);

    const model = createMockModel({
      settings: { sw1: { limit: 5, columns: [] } },
      stats: { sw1: { count: 3, columnCounts: [3], isOverLimit: false } },
      getSwimlaneStats: vi.fn().mockReturnValue({ count: 3, columnCounts: [3], isOverLimit: false }),
    });

    renderSwimlaneVisuals(model, pageObject as unknown as IBoardPagePageObject);

    expect(pageObject.insertSwimlaneComponent).toHaveBeenCalledTimes(1);
    expect(pageObject.insertSwimlaneComponent).toHaveBeenCalledWith(
      sw1.header,
      expect.anything(),
      'swimlane-limit-badge'
    );
  });

  it('should highlight swimlane when limit is exceeded', () => {
    const sw1 = makeSwimlane('sw1');
    pageObject.getSwimlanes.mockReturnValue([sw1]);

    const model = createMockModel({
      settings: { sw1: { limit: 3, columns: [] } },
      stats: { sw1: { count: 5, columnCounts: [5], isOverLimit: true } },
      getSwimlaneStats: vi.fn().mockReturnValue({ count: 5, columnCounts: [5], isOverLimit: true }),
    });

    renderSwimlaneVisuals(model, pageObject as unknown as IBoardPagePageObject);

    expect(pageObject.highlightSwimlane).toHaveBeenCalledWith(sw1.header, true);
  });

  it('should not highlight swimlane when within limit', () => {
    const sw1 = makeSwimlane('sw1');
    pageObject.getSwimlanes.mockReturnValue([sw1]);

    const model = createMockModel({
      settings: { sw1: { limit: 5, columns: [] } },
      stats: { sw1: { count: 2, columnCounts: [2], isOverLimit: false } },
      getSwimlaneStats: vi.fn().mockReturnValue({ count: 2, columnCounts: [2], isOverLimit: false }),
    });

    renderSwimlaneVisuals(model, pageObject as unknown as IBoardPagePageObject);

    expect(pageObject.highlightSwimlane).toHaveBeenCalledWith(sw1.header, false);
  });

  it('should remove old badge before inserting new one', () => {
    const sw1 = makeSwimlane('sw1');
    pageObject.getSwimlanes.mockReturnValue([sw1]);

    const model = createMockModel({
      settings: { sw1: { limit: 5, columns: [] } },
      stats: { sw1: { count: 3, columnCounts: [3], isOverLimit: false } },
      getSwimlaneStats: vi.fn().mockReturnValue({ count: 3, columnCounts: [3], isOverLimit: false }),
    });

    renderSwimlaneVisuals(model, pageObject as unknown as IBoardPagePageObject);

    const removeCallOrder = pageObject.removeSwimlaneComponent.mock.invocationCallOrder[0];
    const insertCallOrder = pageObject.insertSwimlaneComponent.mock.invocationCallOrder[0];
    expect(removeCallOrder).toBeLessThan(insertCallOrder);
  });

  it('should skip swimlane without settings', () => {
    const sw1 = makeSwimlane('sw1');
    pageObject.getSwimlanes.mockReturnValue([sw1]);

    const model = createMockModel({
      settings: {},
      stats: {},
      getSwimlaneStats: vi.fn().mockReturnValue(undefined),
    });

    renderSwimlaneVisuals(model, pageObject as unknown as IBoardPagePageObject);

    expect(pageObject.insertSwimlaneComponent).not.toHaveBeenCalled();
    expect(pageObject.highlightSwimlane).toHaveBeenCalledWith(sw1.header, false);
  });

  it('should handle multiple swimlanes with different states', () => {
    const sw1 = makeSwimlane('sw1');
    const sw2 = makeSwimlane('sw2');
    pageObject.getSwimlanes.mockReturnValue([sw1, sw2]);

    const model = createMockModel({
      settings: {
        sw1: { limit: 2, columns: [] },
        sw2: { limit: 10, columns: [] },
      },
      stats: {
        sw1: { count: 5, columnCounts: [5], isOverLimit: true },
        sw2: { count: 3, columnCounts: [3], isOverLimit: false },
      },
      getSwimlaneStats: vi.fn().mockImplementation((id: string) => {
        if (id === 'sw1') return { count: 5, columnCounts: [5], isOverLimit: true };
        if (id === 'sw2') return { count: 3, columnCounts: [3], isOverLimit: false };
        return undefined;
      }),
    });

    renderSwimlaneVisuals(model, pageObject as unknown as IBoardPagePageObject);

    expect(pageObject.insertSwimlaneComponent).toHaveBeenCalledTimes(2);
    expect(pageObject.highlightSwimlane).toHaveBeenCalledWith(sw1.header, true);
    expect(pageObject.highlightSwimlane).toHaveBeenCalledWith(sw2.header, false);
  });
});
