import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Container } from 'dioma';
import { swimlaneWipLimitsModule } from './module';
import { boardRuntimeModelToken, propertyModelToken } from './tokens';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import { BoardPropertyServiceToken } from 'src/infrastructure/jira/boardPropertyService';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import { boardPagePageObjectToken } from 'src/infrastructure/page-objects/BoardPage';
import { BoardPagePageObjectMock } from 'src/infrastructure/page-objects/BoardPage.mock';
import type { SwimlaneIssueStats, SwimlaneSettings } from './types';

const mockBoardPropertyService = {
  getBoardProperty: vi.fn().mockResolvedValue({}),
  updateBoardProperty: vi.fn(),
  deleteBoardProperty: vi.fn(),
};

describe('swimlaneWipLimitsModule diagnostic callback', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();

    container.register({ token: BoardPropertyServiceToken, value: mockBoardPropertyService });
    container.register({ token: loggerToken, value: new Logger() });
    container.register({ token: boardPagePageObjectToken, value: BoardPagePageObjectMock });

    diagnosticModule.ensure(container);
    swimlaneWipLimitsModule.ensure(container);
  });

  it('registers swimlane-wip-limits-module diagnostic callback', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(diagnosticModel.registeredFeatures).toContain('swimlane-wip-limits-module');
  });

  it('returns §5.3 payload from current model state without side effects', () => {
    const { model: propertyModel } = container.inject(propertyModelToken);
    const { model: boardRuntimeModel } = container.inject(boardRuntimeModelToken);
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    const settings: SwimlaneSettings = {
      swim1: { limit: 5, columns: ['In Progress'] },
    };
    const stats: { [swimlaneId: string]: SwimlaneIssueStats } = {
      swim1: { count: 3, columnCounts: [1, 2, 0], isOverLimit: false },
    };

    propertyModel.settings = settings;
    propertyModel.state = 'loaded';
    propertyModel.error = null;
    boardRuntimeModel.stats = stats;

    const renderSpy = vi.spyOn(boardRuntimeModel, 'render');

    const report = diagnosticModel.collectDiagnosticReport();
    const payload = report['swimlane-wip-limits-module'];

    expect(renderSpy).not.toHaveBeenCalled();
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
    expect(propertyModel.settings).toEqual({});
    expect(propertyModel.error).toBeNull();

    const report = diagnosticModel.collectDiagnosticReport();
    const payload = report['swimlane-wip-limits-module'];

    expect(payload).toEqual({
      settings: {
        boardProperty: {
          state: 'initial',
          error: null,
          settings: {},
        },
        localStorage: null,
      },
      runtime: {
        stats: {},
      },
    });
  });
});
