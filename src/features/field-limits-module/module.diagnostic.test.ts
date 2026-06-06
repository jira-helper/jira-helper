import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Container } from 'dioma';
import { fieldLimitsModule } from './module';
import { boardRuntimeModelToken, propertyModelToken } from './tokens';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';
import { BoardPagePageObjectMock } from 'src/infrastructure/page-objects/BoardPage.mock';
import type { FieldLimitStats, FieldLimitsSettings } from './types';
import { CalcType } from './types';

const mockBoardPropertyService = {
  getBoardProperty: vi.fn().mockResolvedValue({}),
  updateBoardProperty: vi.fn(),
  deleteBoardProperty: vi.fn(),
};

describe('fieldLimitsModule diagnostic callback', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();

    container.register({ token: BoardPropertyServiceToken, value: mockBoardPropertyService });
    container.register({ token: loggerToken, value: new Logger() });
    container.register({ token: boardPagePageObjectToken, value: BoardPagePageObjectMock });

    diagnosticModule.ensure(container);
    fieldLimitsModule.ensure(container);
  });

  it('registers field-limits-module diagnostic callback', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(diagnosticModel.registeredFeatures).toContain('field-limits-module');
  });

  it('returns §5.3 payload from current model state without side effects', () => {
    const { model: propertyModel } = container.inject(propertyModelToken);
    const { model: boardRuntimeModel } = container.inject(boardRuntimeModelToken);
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    const settings: FieldLimitsSettings = {
      limits: {
        'limit-1': {
          calcType: CalcType.EXACT_VALUE,
          fieldValue: 'High',
          fieldId: 'customfield_10001',
          limit: 5,
          columns: ['10001'],
          swimlanes: [],
          visualValue: 'High',
        },
      },
    };
    const stats: Record<string, FieldLimitStats> = {
      'limit-1': {
        current: 3,
        limit: 5,
        isOverLimit: false,
        isOnLimit: false,
        calcType: CalcType.EXACT_VALUE,
      },
    };

    propertyModel.settings = settings;
    propertyModel.state = 'loaded';
    propertyModel.error = null;
    boardRuntimeModel.stats = stats;

    const recalculateSpy = vi.spyOn(boardRuntimeModel, 'recalculate');
    const initializeSpy = vi.spyOn(boardRuntimeModel, 'initialize');

    const report = diagnosticModel.collectDiagnosticReport();
    const payload = report['field-limits-module'];

    expect(recalculateSpy).not.toHaveBeenCalled();
    expect(initializeSpy).not.toHaveBeenCalled();
    expect(payload).toEqual({
      settings: {
        boardProperty: {
          state: 'loaded',
          error: null,
          settings,
        },
        localStorage: null,
      },
      runtime: {
        stats,
      },
    });
    expect(() => JSON.stringify(payload)).not.toThrow();
  });

  it('returns initial property state when board property is not loaded', () => {
    const { model: propertyModel } = container.inject(propertyModelToken);
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(propertyModel.state).toBe('initial');
    expect(propertyModel.settings).toEqual({ limits: {} });
    expect(propertyModel.error).toBeNull();

    const report = diagnosticModel.collectDiagnosticReport();
    const payload = report['field-limits-module'];

    expect(payload).toEqual({
      settings: {
        boardProperty: {
          state: 'initial',
          error: null,
          settings: { limits: {} },
        },
        localStorage: null,
      },
      runtime: {
        stats: {},
      },
    });
  });
});
