import type { Container } from 'dioma';
import { Ok, type Result } from 'ts-results';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import type { FeatureDiagnosticData } from 'src/features/diagnostic-module/types';
import { getSlaConfigSnapshot, SLA_CONFIG_BOARD_PROPERTY_KEY } from './slaConfigSnapshot';

export function collectChartsAddSlaLineDiagnosticData(): Result<FeatureDiagnosticData, Error> {
  const { state, data } = getSlaConfigSnapshot();

  return Ok({
    settings: {
      boardProperty: {
        propertyKey: SLA_CONFIG_BOARD_PROPERTY_KEY,
        state,
        data,
      },
      localStorage: null,
    },
    runtime: null,
  });
}

export function registerChartsAddSlaLineDiagnosticData(container: Container): void {
  const { model: diagnosticModel } = container.inject(diagnosticModelToken);

  diagnosticModel.registerDiagnosticData('charts-add-sla-line', collectChartsAddSlaLineDiagnosticData);
}
