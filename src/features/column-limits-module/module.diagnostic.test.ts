import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Container } from 'dioma';
import { columnLimitsModule } from './module';
import { boardRuntimeModelToken, propertyModelToken } from './tokens';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import type { IBoardPagePageObject } from 'src/infrastructure/page-objects/BoardPage';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';
import type { GroupStats } from './BoardPage/models/types';

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

describe('columnLimitsModule diagnostic callback', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();

    container.register({ token: BoardPropertyServiceToken, value: mockBoardPropertyService });
    container.register({ token: loggerToken, value: new Logger() });
    container.register({ token: boardPagePageObjectToken, value: mockBoardPagePageObject });

    diagnosticModule.ensure(container);
    columnLimitsModule.ensure(container);
  });

  it('registers column-limits-module diagnostic callback', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(diagnosticModel.registeredFeatures).toContain('column-limits-module');
  });

  it('returns §5.3 payload from current model state without side effects', () => {
    const { model: propertyModel } = container.inject(propertyModelToken);
    const { model: boardRuntimeModel } = container.inject(boardRuntimeModelToken);
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    const boardProperty = {
      'Dev group': {
        columns: ['10001', '10002'],
        max: 5,
        customHexColor: '#deebff',
      },
    };
    const groupStats: GroupStats[] = [
      {
        groupId: 'Dev group',
        groupName: 'Dev group',
        columns: ['10001', '10002'],
        currentCount: 3,
        limit: 5,
        isOverLimit: false,
        color: '#deebff',
        ignoredSwimlanes: [],
      },
    ];

    propertyModel.setData(boardProperty);
    boardRuntimeModel.groupStats = groupStats;

    const report = diagnosticModel.collectDiagnosticReport();
    const payload = report['column-limits-module'];

    expect(payload).toEqual({
      settings: {
        boardProperty: {
          state: 'loaded',
          error: null,
          data: boardProperty,
        },
        localStorage: null,
      },
      runtime: {
        groupStats,
      },
    });
    expect(() => JSON.stringify(payload)).not.toThrow();
  });

  it('returns initial property state when board property is not loaded', () => {
    const { model: propertyModel } = container.inject(propertyModelToken);
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(propertyModel.state).toBe('initial');
    expect(propertyModel.data).toEqual({});
    expect(propertyModel.error).toBeNull();

    const report = diagnosticModel.collectDiagnosticReport();
    const payload = report['column-limits-module'];

    expect(payload).toEqual({
      settings: {
        boardProperty: {
          state: 'initial',
          error: null,
          data: {},
        },
        localStorage: null,
      },
      runtime: {
        groupStats: [],
      },
    });
  });
});
