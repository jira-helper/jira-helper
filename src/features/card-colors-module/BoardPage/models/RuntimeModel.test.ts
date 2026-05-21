import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Ok, Err } from 'ts-results';
import { RuntimeModel } from './RuntimeModel';
import type { PropertyModel } from '../../property/PropertyModel';
import type { IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import type { Logger } from 'src/infrastructure/logging/Logger';

describe('RuntimeModel', () => {
  let mockPropertyModel: PropertyModel;
  let mockBoardPage: IBoardPagePageObject;
  let mockLogger: Logger;
  let model: RuntimeModel;

  beforeEach(() => {
    mockPropertyModel = {
      load: vi.fn(),
      isEnabled: vi.fn(() => false),
    } as unknown as PropertyModel;

    mockBoardPage = {
      selectors: {
        issue: '.ghx-issue',
        flagged: '.ghx-flagged',
      },
      classlist: {
        flagged: 'jh-flagged',
      },
    } as unknown as IBoardPagePageObject;

    mockLogger = {
      getPrefixedLog: vi.fn(() => vi.fn()),
    } as unknown as Logger;

    model = new RuntimeModel(mockPropertyModel, mockBoardPage, mockLogger);
    vi.spyOn(document, 'querySelectorAll').mockReturnValue([] as unknown as NodeListOf<Element>);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    model.reset();
  });

  describe('getDiagnosticSnapshot', () => {
    it('returns inactive runtime state by default', () => {
      expect(model.getDiagnosticSnapshot()).toEqual({
        isActive: false,
        error: null,
        intervalActive: false,
      });
      expect(() => JSON.stringify(model.getDiagnosticSnapshot())).not.toThrow();
    });

    it('reflects isActive and error without exposing private fields', async () => {
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Err(new Error('load failed')));

      await model.activate();

      const snapshot = model.getDiagnosticSnapshot();

      expect(snapshot).toEqual({
        isActive: false,
        error: 'load failed',
        intervalActive: false,
      });
      expect(snapshot).not.toHaveProperty('intervalId');
      expect(snapshot).not.toHaveProperty('processedAttribute');
      expect(snapshot).not.toHaveProperty('cleanupCallbacks');
    });

    it('reports intervalActive when processing interval is running', async () => {
      vi.useFakeTimers();
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Ok({ enabled: true }));

      await model.activate();

      expect(model.getDiagnosticSnapshot()).toEqual({
        isActive: true,
        error: null,
        intervalActive: true,
      });

      vi.useRealTimers();
    });

    it('reports intervalActive false after deactivate', async () => {
      vi.useFakeTimers();
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Ok({ enabled: true }));

      await model.activate();
      model.deactivate();

      expect(model.getDiagnosticSnapshot()).toEqual({
        isActive: false,
        error: null,
        intervalActive: false,
      });

      vi.useRealTimers();
    });

    it('does not start interval when card colors are disabled in settings', async () => {
      vi.mocked(mockPropertyModel.load).mockResolvedValue(Ok({ enabled: false }));

      await model.activate();

      expect(model.getDiagnosticSnapshot()).toEqual({
        isActive: false,
        error: null,
        intervalActive: false,
      });
    });
  });
});
