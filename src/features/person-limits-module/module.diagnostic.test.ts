import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Container } from 'dioma';
import { personLimitsModule } from './module';
import { boardRuntimeModelToken, propertyModelToken } from './tokens';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import type { IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';
import type { PersonLimit } from './property/types';

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
} as unknown as IBoardPagePageObject;

describe('personLimitsModule diagnostic callback', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();

    container.register({ token: BoardPropertyServiceToken, value: mockBoardPropertyService });
    container.register({ token: loggerToken, value: new Logger() });
    container.register({ token: boardPagePageObjectToken, value: mockBoardPagePageObject });

    diagnosticModule.ensure(container);
    personLimitsModule.ensure(container);
  });

  it('registers person-limits-module diagnostic callback', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(diagnosticModel.registeredFeatures).toContain('person-limits-module');
  });

  it('returns §5.3 payload from current model state without side effects', () => {
    const { model: propertyModel } = container.inject(propertyModelToken);
    const { model: boardRuntimeModel } = container.inject(boardRuntimeModelToken);
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    const limits: PersonLimit[] = [
      {
        id: 1,
        persons: [
          {
            name: 'john.doe',
            displayName: 'John Doe',
            self: 'https://jira.example.com/rest/api/2/user?username=john.doe',
          },
        ],
        limit: 5,
        columns: [],
        swimlanes: [],
        showAllPersonIssues: true,
        sharedLimit: false,
      },
    ];
    const boardProperty = { limits };

    propertyModel.setData(boardProperty);
    boardRuntimeModel.stats = [
      {
        id: 1,
        persons: [{ name: 'john.doe', displayName: 'John Doe' }],
        limit: 5,
        issues: [],
        columns: [],
        swimlanes: [],
        showAllPersonIssues: true,
        sharedLimit: false,
      },
    ];
    boardRuntimeModel.activePerson = { limitId: 1, personName: null };
    boardRuntimeModel.cssSelectorOfIssues = '.ghx-issue-content';

    const calculateStatsSpy = vi.spyOn(boardRuntimeModel, 'calculateStats');
    const getDiagnosticSnapshotSpy = vi.spyOn(boardRuntimeModel, 'getDiagnosticSnapshot');

    const report = diagnosticModel.collectDiagnosticReport();
    const payload = report['person-limits-module'];

    expect(calculateStatsSpy).not.toHaveBeenCalled();
    expect(getDiagnosticSnapshotSpy).toHaveBeenCalled();
    expect(payload).toEqual({
      settings: {
        boardProperty: {
          state: 'loaded',
          error: null,
          data: boardProperty,
        },
        localStorage: null,
      },
      runtime: boardRuntimeModel.getDiagnosticSnapshot(),
    });
    expect(() => JSON.stringify(payload)).not.toThrow();
  });

  it('returns initial property state when board property is not loaded', () => {
    const { model: propertyModel } = container.inject(propertyModelToken);
    const { model: boardRuntimeModel } = container.inject(boardRuntimeModelToken);
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(propertyModel.state).toBe('initial');
    expect(propertyModel.data).toEqual({ limits: [] });
    expect(propertyModel.error).toBeNull();

    const report = diagnosticModel.collectDiagnosticReport();
    const payload = report['person-limits-module'];

    expect(payload).toEqual({
      settings: {
        boardProperty: {
          state: 'initial',
          error: null,
          data: { limits: [] },
        },
        localStorage: null,
      },
      runtime: boardRuntimeModel.getDiagnosticSnapshot(),
    });
  });
});
