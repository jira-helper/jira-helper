import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Container } from 'dioma';
import { loggerToken, Logger } from 'src/infrastructure/logging/Logger';
import { diagnosticModule } from 'src/features/diagnostic-module/module';
import { diagnosticModelToken } from 'src/features/diagnostic-module/tokens';
import {
  BUG_TEMPLATE_STORAGE_KEY,
  collectBugTemplateDiagnosticData,
  registerBugTemplateDiagnosticData,
} from './diagnosticRegistration';

describe('bug-template diagnostic callback', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
    container.register({ token: loggerToken, value: new Logger() });
    localStorage.clear();
    diagnosticModule.ensure(container);
    registerBugTemplateDiagnosticData(container);
  });

  it('registers bug-template diagnostic callback', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    expect(diagnosticModel.registeredFeatures).toContain('bug-template');
  });

  it('returns §5.3 payload with bugTemplate localStorage value', () => {
    const template = 'Device:\nOS:\n';
    localStorage.setItem(BUG_TEMPLATE_STORAGE_KEY, template);

    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');

    const result = collectBugTemplateDiagnosticData();
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const payload = result.val;
    expect(payload).toEqual({
      settings: {
        boardProperty: null,
        localStorage: { bugTemplate: template },
      },
      runtime: null,
    });
    expect(getItemSpy).toHaveBeenCalledWith(BUG_TEMPLATE_STORAGE_KEY);
    expect(() => JSON.stringify(payload)).not.toThrow();

    getItemSpy.mockRestore();
  });

  it('collects via DiagnosticModel with null when key is absent', () => {
    const { model: diagnosticModel } = container.inject(diagnosticModelToken);

    const report = diagnosticModel.collectDiagnosticReport();

    expect(report['bug-template']).toEqual({
      settings: {
        boardProperty: null,
        localStorage: { bugTemplate: null },
      },
      runtime: null,
    });
  });
});
