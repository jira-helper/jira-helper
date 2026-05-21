import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Container } from 'dioma';
import { cardColorsModule } from './module';
import { propertyModelToken, runtimeModelToken } from './tokens';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import type { IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';

const mockBoardPropertyService = {
  getBoardProperty: vi.fn().mockResolvedValue({}),
  updateBoardProperty: vi.fn(),
  deleteBoardProperty: vi.fn(),
};

const mockBoardPagePageObject: IBoardPagePageObject = {
  getOrderedColumnIds: vi.fn(() => []),
  getColumnHeaderElement: vi.fn(() => null),
  getSwimlaneIds: vi.fn(() => []),
  getIssueCountInColumn: vi.fn(() => 0),
  styleColumnHeader: vi.fn(),
  resetColumnHeaderStyles: vi.fn(),
  insertColumnHeaderHtml: vi.fn(),
  removeColumnHeaderElements: vi.fn(),
  highlightColumnCells: vi.fn(),
  resetColumnCellStyles: vi.fn(),
  selectors: {
    pool: '.ghx-pool',
    issue: '.ghx-issue',
    column: '.ghx-column',
    columnHeader: '.ghx-column-header',
    columnTitle: '.ghx-column-title',
    swimlaneRow: '.ghx-swimlane',
    swimlaneHeader: '.ghx-swimlane-header',
    grabber: '.ghx-grabber',
    flagged: '.ghx-flagged',
  },
  classlist: {
    flagged: 'jh-flagged',
  },
} as unknown as IBoardPagePageObject;

describe('cardColorsModule diagnostic callback', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();

    container.register({ token: BoardPropertyServiceToken, value: mockBoardPropertyService });
    container.register({ token: loggerToken, value: new Logger() });
    container.register({ token: boardPagePageObjectToken, value: mockBoardPagePageObject });

    diagnosticModule.ensure(container);
    cardColorsModule.ensure(container);
  });

  it('registers card-colors-module diagnostic callback', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(diagnosticModel.registeredFeatures).toContain('card-colors-module');
  });

  it('returns §5.3 payload from current model state without side effects', () => {
    const { model: propertyModel } = container.inject(propertyModelToken);
    const { model: runtimeModel } = container.inject(runtimeModelToken);
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    const settings = { enabled: true };

    propertyModel.settings = settings;
    propertyModel.state = 'loaded';
    propertyModel.error = null;
    runtimeModel.isActive = true;
    runtimeModel.error = 'runtime warning';

    const loadSpy = vi.spyOn(propertyModel, 'load');
    const activateSpy = vi.spyOn(runtimeModel, 'activate');
    const getDiagnosticSnapshotSpy = vi.spyOn(runtimeModel, 'getDiagnosticSnapshot');

    const report = diagnosticModel.collectDiagnosticReport();
    const payload = report['card-colors-module'];

    expect(loadSpy).not.toHaveBeenCalled();
    expect(activateSpy).not.toHaveBeenCalled();
    expect(getDiagnosticSnapshotSpy).toHaveBeenCalled();
    expect(payload).toEqual({
      settings: {
        boardProperty: {
          state: 'loaded',
          error: null,
          settings,
        },
        localStorage: null,
      },
      runtime: runtimeModel.getDiagnosticSnapshot(),
    });
    expect(() => JSON.stringify(payload)).not.toThrow();
  });

  it('returns initial property state when board property is not loaded', () => {
    const { model: propertyModel } = container.inject(propertyModelToken);
    const { model: runtimeModel } = container.inject(runtimeModelToken);
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(propertyModel.state).toBe('initial');
    expect(propertyModel.settings).toEqual({ enabled: false });
    expect(propertyModel.error).toBeNull();

    const report = diagnosticModel.collectDiagnosticReport();
    const payload = report['card-colors-module'];

    expect(payload).toEqual({
      settings: {
        boardProperty: {
          state: 'initial',
          error: null,
          settings: { enabled: false },
        },
        localStorage: null,
      },
      runtime: runtimeModel.getDiagnosticSnapshot(),
    });
  });
});
