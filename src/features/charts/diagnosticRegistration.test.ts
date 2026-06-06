import { beforeEach, describe, expect, it } from 'vitest';
import { Container } from 'dioma';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import {
  collectChartsAddSlaLineDiagnosticData,
  registerChartsAddSlaLineDiagnosticData,
} from './diagnosticRegistration';
import { getSlaConfigSnapshot, resetSlaConfigSnapshot, setSlaConfigSnapshot } from './slaConfigSnapshot';

describe('charts-add-sla-line diagnostic callback', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.register({ token: loggerToken, value: new Logger() });
    resetSlaConfigSnapshot();
    diagnosticModule.ensure(container);
    registerChartsAddSlaLineDiagnosticData(container);
  });

  it('registers charts-add-sla-line diagnostic callback', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(diagnosticModel.registeredFeatures).toContain('charts-add-sla-line');
  });

  it('returns §5.3 payload with slaConfig3 board property snapshot', () => {
    setSlaConfigSnapshot({ value: 42 });

    const result = collectChartsAddSlaLineDiagnosticData();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const payload = result.val;
    expect(payload).toEqual({
      settings: {
        boardProperty: {
          propertyKey: BOARD_PROPERTIES.SLA_CONFIG,
          state: 'loaded',
          data: { value: 42 },
        },
        localStorage: null,
      },
      runtime: null,
    });
    expect(() => JSON.stringify(payload)).not.toThrow();
  });

  it('collects initial snapshot via DiagnosticModel when SLA not loaded', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    const report = diagnosticModel.collectDiagnosticReport();

    expect(report['charts-add-sla-line']).toEqual({
      settings: {
        boardProperty: {
          propertyKey: BOARD_PROPERTIES.SLA_CONFIG,
          state: 'initial',
          data: null,
        },
        localStorage: null,
      },
      runtime: null,
    });
    expect(getSlaConfigSnapshot()).toEqual({ state: 'initial', data: null });
  });
});
