import type { Container } from 'dioma';
import { Ok, type Result } from 'ts-results';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import type { FeatureDiagnosticData } from 'src/features/diagnostic-module/types';
import { BOARD_PROPERTIES } from 'src/shared/constants';
import { useWipLimitCellsPropertyStore } from './property/store';

export function collectWiplimitOnCellsDiagnosticData(): Result<FeatureDiagnosticData, Error> {
  const { data, state } = useWipLimitCellsPropertyStore.getState();

  return Ok({
    settings: {
      boardProperty: {
        propertyKey: BOARD_PROPERTIES.WIP_LIMITS_CELLS,
        state,
        data,
      },
      localStorage: null,
    },
    runtime: null,
  });
}

export function registerWiplimitOnCellsDiagnosticData(container: Container): void {
  const { model: diagnosticModel } = container.inject(diagnosticModelToken);

  diagnosticModel.registerDiagnosticData('wiplimit-on-cells', collectWiplimitOnCellsDiagnosticData);
}
