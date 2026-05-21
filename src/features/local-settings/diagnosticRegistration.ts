import type { Container } from 'dioma';
import { Ok, type Result } from 'ts-results';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import type { FeatureDiagnosticData } from 'src/features/diagnostic-module/types';
import { useLocalSettingsStore } from './stores/localSettingsStore';

export function collectLocalSettingsDiagnosticData(): Result<FeatureDiagnosticData, Error> {
  const { settings } = useLocalSettingsStore.getState();

  return Ok({
    settings: {
      boardProperty: null,
      localStorage: settings,
    },
    runtime: null,
  } as unknown as FeatureDiagnosticData);
}

export function registerLocalSettingsDiagnosticData(container: Container): void {
  const { model: diagnosticModel } = container.inject(diagnosticModelToken);

  diagnosticModel.registerDiagnosticData('local-settings', collectLocalSettingsDiagnosticData);
}
