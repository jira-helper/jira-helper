import type { Container } from 'dioma';
import { Ok, type Result } from 'ts-results';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import type { FeatureDiagnosticData } from 'src/features/diagnostic-module/types';

export const BLUR_SENSITIVE_STORAGE_KEY = 'blurSensitive';

export function collectBlurForSensitiveDiagnosticData(): Result<FeatureDiagnosticData, Error> {
  return Ok({
    settings: {
      boardProperty: null,
      localStorage: {
        blurSensitive: localStorage.getItem(BLUR_SENSITIVE_STORAGE_KEY),
      },
    },
    runtime: null,
  });
}

export function registerBlurForSensitiveDiagnosticData(container: Container): void {
  const { model: diagnosticModel } = container.inject(diagnosticModelToken);

  diagnosticModel.registerDiagnosticData('blur-for-sensitive', collectBlurForSensitiveDiagnosticData);
}
