import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Err, Ok } from 'ts-results';
import type { Logger } from 'src/infrastructure/logging/Logger';
import type { CollectedDiagnosticPayload, FeatureDiagnosticData } from '../types';
import { DiagnosticModel } from './DiagnosticModel';
import manifest from '../../../../manifest.json';

/** Legacy export fields (backward compat with pre–featureDiagnostics export). */
const LEGACY_EXPORT_KEYS = [
  'messages',
  'html',
  'href',
  'pluginVersion',
  'jiraVersion',
] as const satisfies readonly (keyof Omit<CollectedDiagnosticPayload, 'featureDiagnostics'>)[];

describe('DiagnosticModel', () => {
  let mockLogger: Logger;
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    mockLogger = {
      getMessages: vi.fn(() => [{ level: 'info', text: 'test log' }]),
      getPrefixedLog: vi.fn(() => vi.fn()),
    } as unknown as Logger;

    document.body.innerHTML = '<div id="board">test</div>';
    document.body.setAttribute('data-version', '9.12.0');

    Object.defineProperty(window, 'location', {
      value: { href: 'https://jira.example.com/board/1' },
      writable: true,
      configurable: true,
    });

    URL.createObjectURL = vi.fn(() => 'blob:diagnostic');
    URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
    vi.restoreAllMocks();
  });

  function createModel(): DiagnosticModel {
    return new DiagnosticModel(mockLogger);
  }

  /** Mocks anchor download flow — no real DOM navigation. */
  function mockDownloadAnchor(): {
    clickSpy: ReturnType<typeof vi.spyOn>;
    anchor: HTMLAnchorElement;
  } {
    const anchor = document.createElement('a');
    const clickSpy = vi.spyOn(anchor, 'click').mockImplementation(() => undefined);
    vi.spyOn(document, 'createElement').mockReturnValue(anchor);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => anchor);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => anchor);
    return { clickSpy, anchor };
  }

  function isCollectedExportPayload(value: unknown): value is CollectedDiagnosticPayload {
    return (
      typeof value === 'object' &&
      value !== null &&
      'featureDiagnostics' in value &&
      'messages' in value &&
      'html' in value
    );
  }

  /** Spy JSON.stringify but only fail/slice full export payloads (not per-feature checks). */
  function spyExportStringify(onExportPayload?: (payload: CollectedDiagnosticPayload) => void) {
    const originalStringify = JSON.stringify.bind(JSON);
    return vi.spyOn(JSON, 'stringify').mockImplementation((value, replacer?, space?) => {
      if (isCollectedExportPayload(value)) {
        onExportPayload?.(value);
      }
      return originalStringify(value, replacer, space);
    });
  }

  describe('registry (S1 / last-write-wins)', () => {
    it('tracks registered feature names in registeredFeatures', () => {
      const model = createModel();

      model.registerDiagnosticData('column-limits-module', () => Ok({ settings: {} }));
      model.registerDiagnosticData('person-limits-module', () => Ok({ runtime: {} }));

      expect(model.registeredFeatures).toEqual(['column-limits-module', 'person-limits-module']);
      expect(model.getState()).toEqual({
        callbacksCount: 2,
        registeredFeatures: ['column-limits-module', 'person-limits-module'],
      });
    });

    it('last-write-wins when the same featureName is registered twice', () => {
      const model = createModel();
      const first = vi.fn(() => Ok({ v: 1 }));
      const second = vi.fn(() => Ok({ v: 2 }));

      model.registerDiagnosticData('column-limits-module', first);
      model.registerDiagnosticData('column-limits-module', second);

      expect(model.registeredFeatures).toEqual(['column-limits-module']);
      expect(model.collectDiagnosticReport()).toEqual({
        'column-limits-module': { v: 2 },
      });
      expect(first).not.toHaveBeenCalled();
      expect(second).toHaveBeenCalledTimes(1);
    });

    it('reset clears registry and restores initial state', () => {
      const model = createModel();
      model.registerDiagnosticData('column-limits-module', () => Ok({}));

      model.reset();

      expect(model.registeredFeatures).toEqual([]);
      expect(model.getState()).toEqual(model.getInitialState());
      expect(model.collectDiagnosticReport()).toEqual({});
    });
  });

  describe('collectDiagnosticReport (S2 / S3 / §5.7 phase 1)', () => {
    it('S2: merges Ok results from all registered callbacks', () => {
      const model = createModel();
      model.registerDiagnosticData('column-limits-module', () => Ok({ settings: { boardProperty: {} } }));
      model.registerDiagnosticData('person-limits-module', () => Ok({ runtime: { count: 3 } }));

      expect(model.collectDiagnosticReport()).toEqual({
        'column-limits-module': { settings: { boardProperty: {} } },
        'person-limits-module': { runtime: { count: 3 } },
      });
    });

    it('S3: records error when one callback throws without blocking others', () => {
      const model = createModel();
      model.registerDiagnosticData('broken-feature', () => {
        throw new Error('callback exploded');
      });
      model.registerDiagnosticData('healthy-feature', () => Ok({ ok: true }));

      const report = model.collectDiagnosticReport();

      expect(report['broken-feature']).toEqual({
        error: expect.objectContaining({
          message: 'callback exploded',
          name: 'Error',
        }),
      });
      expect(report['healthy-feature']).toEqual({ ok: true });
    });

    it('S3: records error when one callback returns Err without blocking others', () => {
      const model = createModel();
      model.registerDiagnosticData('err-feature', () => Err(new Error('snapshot unavailable')));
      model.registerDiagnosticData('ok-feature', () => Ok({ value: 1 }));

      const report = model.collectDiagnosticReport();

      expect(report['err-feature']).toEqual({
        error: expect.objectContaining({
          message: 'snapshot unavailable',
          name: 'Error',
        }),
      });
      expect(report['ok-feature']).toEqual({ value: 1 });
    });

    it('§5.7 phase 1: non-serializable Ok payload becomes per-feature error', () => {
      const model = createModel();
      const circular: FeatureDiagnosticData = {};
      (circular as { self?: FeatureDiagnosticData }).self = circular;

      model.registerDiagnosticData('circular-feature', () => Ok(circular));
      model.registerDiagnosticData('ok-feature', () => Ok({ safe: true }));

      const report = model.collectDiagnosticReport();

      expect(report['ok-feature']).toEqual({ safe: true });
      expect(report['circular-feature']).toEqual({
        error: expect.objectContaining({
          message: expect.stringContaining('Non-serializable diagnostic data from circular-feature'),
        }),
      });
    });
  });

  describe('export payload integration (TASK-101)', () => {
    it('buildExportPayload exposes all 5 legacy keys with correct types', () => {
      const model = createModel();

      const payload = model.buildExportPayload();

      for (const key of LEGACY_EXPORT_KEYS) {
        expect(payload).toHaveProperty(key);
      }
      expect(Array.isArray(payload.messages)).toBe(true);
      expect(payload.messages).toEqual([{ level: 'info', text: 'test log' }]);
      expect(typeof payload.html).toBe('string');
      expect(payload.html).toBe('<div id="board">test</div>');
      expect(typeof payload.href).toBe('string');
      expect(payload.href).toBe('https://jira.example.com/board/1');
      expect(typeof payload.pluginVersion).toBe('string');
      expect(payload.pluginVersion).toBe(manifest.version);
      expect(typeof payload.jiraVersion).toBe('string');
      expect(payload.jiraVersion).toBe('9.12.0');
      expect(mockLogger.getMessages).toHaveBeenCalledTimes(1);
    });

    it('populates featureDiagnostics when callbacks are registered', () => {
      const model = createModel();
      model.registerDiagnosticData('column-limits-module', () => Ok({ settings: { boardProperty: {} } }));
      model.registerDiagnosticData('person-limits-module', () => Ok({ runtime: { count: 2 } }));

      const { featureDiagnostics, ...legacy } = model.buildExportPayload();

      expect(legacy).toEqual({
        messages: [{ level: 'info', text: 'test log' }],
        html: '<div id="board">test</div>',
        href: 'https://jira.example.com/board/1',
        pluginVersion: manifest.version,
        jiraVersion: '9.12.0',
      });
      expect(featureDiagnostics).toEqual({
        'column-limits-module': { settings: { boardProperty: {} } },
        'person-limits-module': { runtime: { count: 2 } },
      });
    });

    it('featureDiagnostics is empty when no callbacks are registered', () => {
      expect(createModel().buildExportPayload().featureDiagnostics).toEqual({});
    });

    it('saveDiagnosticData falls back to legacy-only export when aggregate stringify fails', () => {
      const model = createModel();
      model.registerDiagnosticData('column-limits-module', () => Ok({ settings: {} }));
      const { clickSpy } = mockDownloadAnchor();
      const originalStringify = JSON.stringify.bind(JSON);
      let exportStringifyAttempts = 0;
      const legacyOnlyPayloads: Record<string, unknown>[] = [];
      vi.spyOn(JSON, 'stringify').mockImplementation((value, replacer?, space?) => {
        if (isCollectedExportPayload(value)) {
          exportStringifyAttempts += 1;
          if (exportStringifyAttempts === 1) {
            throw new Error('aggregate stringify failed');
          }
        }
        if (typeof value === 'object' && value !== null && 'messages' in value && !('featureDiagnostics' in value)) {
          legacyOnlyPayloads.push(value as Record<string, unknown>);
        }
        return originalStringify(value, replacer, space);
      });

      model.saveDiagnosticData();

      expect(exportStringifyAttempts).toBe(1);
      expect(legacyOnlyPayloads).toHaveLength(1);
      expect(legacyOnlyPayloads[0]).toEqual({
        messages: [{ level: 'info', text: 'test log' }],
        html: '<div id="board">test</div>',
        href: 'https://jira.example.com/board/1',
        pluginVersion: manifest.version,
        jiraVersion: '9.12.0',
      });
      expect(legacyOnlyPayloads[0]).not.toHaveProperty('featureDiagnostics');
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('saveDiagnosticData download (§5.7 phase 2)', () => {
    it('downloads JSON with full payload when stringify succeeds', () => {
      const model = createModel();
      const { clickSpy } = mockDownloadAnchor();
      const exportPayloads: CollectedDiagnosticPayload[] = [];
      spyExportStringify(payload => exportPayloads.push(payload));
      model.registerDiagnosticData('column-limits-module', () => Ok({ settings: {} }));

      model.saveDiagnosticData();

      expect(exportPayloads).toHaveLength(1);
      const downloaded = exportPayloads[0];
      expect(downloaded.featureDiagnostics).toEqual({
        'column-limits-module': { settings: {} },
      });
      for (const key of LEGACY_EXPORT_KEYS) {
        expect(downloaded).toHaveProperty(key);
      }
      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
      const blobArg = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
      expect(blobArg.type).toBe('application/json');
      expect(clickSpy).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:diagnostic');
    });
  });
});
