import type { Container } from 'dioma';
import { Ok, type Result } from 'ts-results';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import type { FeatureDiagnosticData } from 'src/features/diagnostic-module/types';
import { useAdditionalCardElementsBoardPropertyStore } from './stores/additionalCardElementsBoardProperty';

export const ADDITIONAL_CARD_ELEMENTS_BOARD_PROPERTY_KEY = 'additional-card-elements';

export function collectAdditionalCardElementsDiagnosticData(): Result<FeatureDiagnosticData, Error> {
  const { data, state } = useAdditionalCardElementsBoardPropertyStore.getState();

  return Ok({
    settings: {
      boardProperty: {
        propertyKey: ADDITIONAL_CARD_ELEMENTS_BOARD_PROPERTY_KEY,
        state,
        data,
      },
      localStorage: null,
    },
    runtime: null,
  });
}

export function registerAdditionalCardElementsDiagnosticData(container: Container): void {
  const { model: diagnosticModel } = container.inject(diagnosticModelToken);

  diagnosticModel.registerDiagnosticData('additional-card-elements', collectAdditionalCardElementsDiagnosticData);
}
