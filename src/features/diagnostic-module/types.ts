import type { Result } from 'ts-results';

/**
 * JSON-serializable value for feature diagnostic payloads.
 */
export type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

/**
 * Plain object returned by a feature callback on success (`Result.ok`).
 *
 * TypeScript does not enforce shape — in v1 each feature should follow the recommended
 * convention: `{ settings: { boardProperty, localStorage }, runtime }`.
 *
 * @see `.agents/tasks/diagnostic-data-collection/developer-guide.md` — «Рекомендованный payload»
 * @see `.agents/tasks/diagnostic-data-collection/requirements.md` §5.3
 */
export type FeatureDiagnosticData = { [key: string]: JsonValue };

/**
 * Per-feature failure entry in {@link DiagnosticReport}.
 *
 * Used when the callback throws, returns `Err`, or the Ok payload is not JSON-serializable.
 * Other features in the same export are still collected.
 */
export type FeatureDiagnosticError = {
  error: {
    message: string;
    name?: string;
    stack?: string;
  };
};

/**
 * Aggregated snapshots from all registered feature callbacks.
 *
 * Keys are canonical `featureName` strings (requirements §5.4); values are either
 * {@link FeatureDiagnosticData} or {@link FeatureDiagnosticError}.
 */
export type DiagnosticReport = Record<string, FeatureDiagnosticData | FeatureDiagnosticError>;

/**
 * Synchronous, side-effect-free supplier registered via
 * {@link DiagnosticModelApi.registerDiagnosticData}.
 *
 * Must only read existing state (models, stores, `localStorage.getItem`); no `await`, I/O,
 * or mutating calls (`load`, `save`, `render`, `recalculate`, …).
 *
 * @see `.agents/tasks/diagnostic-data-collection/developer-guide.md` — «Правила callback»
 */
export type FeatureDiagnosticCallback = () => Result<FeatureDiagnosticData, Error>;

/**
 * Full JSON payload written by diagnostic export (Settings tab download).
 *
 * Legacy Jira/page fields plus `featureDiagnostics` from {@link DiagnosticReport}.
 */
export type CollectedDiagnosticPayload = {
  messages: unknown[];
  html: string;
  href: string;
  pluginVersion: string;
  jiraVersion: string;
  featureDiagnostics: DiagnosticReport;
};

/**
 * API diagnostic-модуля: registry + collect + export.
 *
 * Features call {@link DiagnosticModelApi.registerDiagnosticData} once at bootstrap;
 * export flow calls {@link DiagnosticModelApi.collectDiagnosticReport} and merges into
 * {@link CollectedDiagnosticPayload.featureDiagnostics}.
 */
export interface DiagnosticModelApi {
  /**
   * Registers a per-feature snapshot callback. Last registration wins for duplicate `featureName`.
   *
   * @param featureName — canonical key (requirements §5.4); appears in export JSON.
   * @param callback — {@link FeatureDiagnosticCallback}; payload should follow convention §5.3.
   */
  registerDiagnosticData(featureName: string, callback: FeatureDiagnosticCallback): void;

  /** Invokes all registered callbacks; faults are isolated per feature. */
  collectDiagnosticReport(): DiagnosticReport;

  /** Builds {@link CollectedDiagnosticPayload} and triggers browser download. */
  saveDiagnosticData(): void;

  /** Clears registry (tests / container teardown). */
  reset(): void;
}
