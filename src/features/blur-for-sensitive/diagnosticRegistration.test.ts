import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Container } from 'dioma';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import {
  BLUR_SENSITIVE_STORAGE_KEY,
  collectBlurForSensitiveDiagnosticData,
  registerBlurForSensitiveDiagnosticData,
} from './diagnosticRegistration';

describe('blur-for-sensitive diagnostic callback', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.register({ token: loggerToken, value: new Logger() });
    localStorage.clear();
    diagnosticModule.ensure(container);
    registerBlurForSensitiveDiagnosticData(container);
  });

  it('registers blur-for-sensitive diagnostic callback', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(diagnosticModel.registeredFeatures).toContain('blur-for-sensitive');
  });

  it('returns §5.3 payload with blurSensitive localStorage value', () => {
    localStorage.setItem(BLUR_SENSITIVE_STORAGE_KEY, 'true');

    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

    const result = collectBlurForSensitiveDiagnosticData();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const payload = result.val;
    expect(payload).toEqual({
      settings: {
        boardProperty: null,
        localStorage: { blurSensitive: 'true' },
      },
      runtime: null,
    });
    expect(getItemSpy).toHaveBeenCalledWith(BLUR_SENSITIVE_STORAGE_KEY);
    expect(() => JSON.stringify(payload)).not.toThrow();

    getItemSpy.mockRestore();
  });

  it('collects via DiagnosticModel with null when key is absent', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    const report = diagnosticModel.collectDiagnosticReport();

    expect(report['blur-for-sensitive']).toEqual({
      settings: {
        boardProperty: null,
        localStorage: { blurSensitive: null },
      },
      runtime: null,
    });
  });
});
