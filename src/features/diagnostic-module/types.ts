import type { Result } from 'ts-results';

/**
 * JSON-serializable payload от фичи для диагностики.
 * TypeScript не ограничивает shape — см. recommended convention в developer-guide.
 */
export type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];

export type FeatureDiagnosticData = { [key: string]: JsonValue };

/**
 * Ошибка сбора данных конкретной фичи.
 */
export type FeatureDiagnosticError = {
  error: {
    message: string;
    name?: string;
    stack?: string;
  };
};

/**
 * Формат итогового отчета: featureName -> data | error.
 */
export type DiagnosticReport = Record<string, FeatureDiagnosticData | FeatureDiagnosticError>;

/**
 * Синхронный и side-effect free callback фичи.
 */
export type FeatureDiagnosticCallback = () => Result<FeatureDiagnosticData, Error>;

/**
 * Полный payload экспорта диагностики (базовые данные + featureDiagnostics).
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
 */
export interface DiagnosticModelApi {
  registerDiagnosticData(featureName: string, callback: FeatureDiagnosticCallback): void;
  collectDiagnosticReport(): DiagnosticReport;
  saveDiagnosticData(): void;
  reset(): void;
}
