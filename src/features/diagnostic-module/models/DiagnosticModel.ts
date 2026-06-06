import type { Logger } from 'src/infrastructure/logging/Logger';
import manifest from '../../../../manifest.json';
import type {
  CollectedDiagnosticPayload,
  DiagnosticModelApi,
  DiagnosticReport,
  FeatureDiagnosticCallback,
  FeatureDiagnosticData,
  FeatureDiagnosticError,
} from '../types';

/**
 * In-memory registry диагностических callback + export flow.
 */
export interface DiagnosticModelState {
  readonly callbacksCount: number;
  readonly registeredFeatures: readonly string[];
}

type LegacyDiagnosticPayload = Pick<
  CollectedDiagnosticPayload,
  'messages' | 'html' | 'href' | 'pluginVersion' | 'jiraVersion'
>;

type DiagnosticDownloadPayload = CollectedDiagnosticPayload | LegacyDiagnosticPayload;

/**
 * Valtio-backed model (via modelEntry → proxy).
 * Public fields — reactive; Map callbacks — internal storage.
 */
export class DiagnosticModel implements DiagnosticModelApi {
  /** Reactive: список зарегистрированных featureName (для debug UI / useModel). */
  registeredFeatures: string[] = [];

  private callbacksByFeature = new Map<string, FeatureDiagnosticCallback>();

  constructor(private readonly logger: Logger) {}

  registerDiagnosticData(featureName: string, callback: FeatureDiagnosticCallback): void {
    this.callbacksByFeature.set(featureName, callback);
    this.registeredFeatures = [...this.callbacksByFeature.keys()];
  }

  /**
   * Синхронно вызывает все зарегистрированные callbacks.
   * Ошибки одной фичи не прерывают сбор остальных.
   */
  collectDiagnosticReport(): DiagnosticReport {
    const report: DiagnosticReport = {};

    for (const [featureName, callback] of this.callbacksByFeature) {
      try {
        const result = callback();
        if (!result.ok) {
          report[featureName] = this.toFeatureError(result.val);
          continue;
        }
        report[featureName] = this.ensureSerializable(result.val, featureName);
      } catch (error) {
        report[featureName] = this.toFeatureError(error);
      }
    }

    return report;
  }

  /** Per-feature JSON.stringify check (requirements §5.7 phase 1). */
  private ensureSerializable(
    data: FeatureDiagnosticData,
    featureName: string
  ): FeatureDiagnosticData | FeatureDiagnosticError {
    try {
      JSON.stringify(data);
      return data;
    } catch (error) {
      return this.toFeatureError(new Error(`Non-serializable diagnostic data from ${featureName}: ${error}`));
    }
  }

  /**
   * Собирает полный payload и инициирует скачивание JSON-файла.
   * MIGRATE from legacy actions/saveDiagnosticData.ts.
   */
  saveDiagnosticData(): void {
    const payload = this.buildExportPayload();
    const filename = `diagnostic_data_${new Date().toISOString().replace(/:/g, '-')}.json`;
    try {
      this.downloadJson(payload, filename);
    } catch {
      const { messages, html, href, pluginVersion, jiraVersion } = payload;
      this.downloadJson({ messages, html, href, pluginVersion, jiraVersion }, filename);
    }
  }

  buildExportPayload(): CollectedDiagnosticPayload {
    return {
      messages: this.logger.getMessages(),
      html: window.document.body.innerHTML || 'unable to retrieve html',
      href: window.location.href,
      pluginVersion: manifest.version,
      jiraVersion: document.body.getAttribute('data-version') || 'unknown',
      featureDiagnostics: this.collectDiagnosticReport(),
    };
  }

  reset(): void {
    this.callbacksByFeature.clear();
    this.registeredFeatures = [];
  }

  getState(): DiagnosticModelState {
    return {
      callbacksCount: this.callbacksByFeature.size,
      registeredFeatures: this.registeredFeatures,
    };
  }

  getInitialState(): DiagnosticModelState {
    return { callbacksCount: 0, registeredFeatures: [] };
  }

  private toFeatureError(error: unknown): FeatureDiagnosticError {
    if (error instanceof Error) {
      return { error: { message: error.message, name: error.name, stack: error.stack } };
    }
    return { error: { message: String(error) } };
  }

  private downloadJson(payload: DiagnosticDownloadPayload, filename: string): void {
    const dataStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}
