import { beforeEach, describe, expect, it } from 'vitest';
import { Container } from 'dioma';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import { STORAGE_KEY } from './actions/loadLocalSettings';
import { useLocalSettingsStore } from './stores/localSettingsStore';
import { collectLocalSettingsDiagnosticData, registerLocalSettingsDiagnosticData } from './diagnosticRegistration';

describe('local-settings diagnostic callback', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.register({ token: loggerToken, value: new Logger() });
    useLocalSettingsStore.setState(useLocalSettingsStore.getInitialState());
    diagnosticModule.ensure(container);
    registerLocalSettingsDiagnosticData(container);
  });

  it('registers local-settings diagnostic callback', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(diagnosticModel.registeredFeatures).toContain('local-settings');
  });

  it('returns §5.3 payload with settings snapshot from store', () => {
    useLocalSettingsStore.getState().updateSettings({ locale: 'ru' });

    const result = collectLocalSettingsDiagnosticData();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const payload = result.val;
    expect(payload).toEqual({
      settings: {
        boardProperty: null,
        localStorage: { locale: 'ru' },
      },
      runtime: null,
    });
    expect(() => JSON.stringify(payload)).not.toThrow();
  });

  it('collects via DiagnosticModel from store without reading localStorage', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ locale: 'en' }));
    useLocalSettingsStore.getState().updateSettings({ locale: 'ru' });

    const report = diagnosticModel.collectDiagnosticReport();

    expect(report['local-settings']).toEqual({
      settings: {
        boardProperty: null,
        localStorage: { locale: 'ru' },
      },
      runtime: null,
    });
  });
});
