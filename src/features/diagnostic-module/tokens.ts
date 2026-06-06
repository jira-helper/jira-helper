import { Token } from 'dioma';
import { createModelToken } from 'src/infrastructure/di/Module';
import type { DiagnosticBoardPage } from './BoardPage';
import type { DiagnosticModel } from './models/DiagnosticModel';

/**
 * Valtio-backed registry for feature diagnostic callbacks.
 *
 * Lifecycle: application-scope lazy singleton per DI container after first resolve (`DiagnosticModule.register`).
 * Bootstrap: `diagnosticModule.ensure(container)` must run **first among feature modules** in `content.ts`
 * (requirements §5.5) — before any feature that injects this token in `register()`.
 *
 * Consumers: feature `module.register()` / legacy DI init — `registerDiagnosticData(featureName, callback)`;
 * `SettingsTab` — `model.saveDiagnosticData()` (developer-guide).
 */
export const diagnosticModelToken = createModelToken<DiagnosticModel>('diagnostic-module/diagnosticModel');

/**
 * PageModification for the diagnostic settings tab on board pages.
 *
 * Lifecycle: value registration in `content.ts` when PageModification instances are registered (not via Module.lazy).
 * Consumers: global PageModification registry / `content.ts` bootstrap only.
 */
export const diagnosticBoardPageToken = new Token<DiagnosticBoardPage>('DiagnosticBoardPage');
