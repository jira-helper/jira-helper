# Review: TASK-104 — swimlane-wip-limits-module diagnostic

**Дата**: 2026-05-20
**TASK**: [TASK-104-swimlane-wip-limits-diagnostic.md](./TASK-104-swimlane-wip-limits-diagnostic.md)
**Вердикт**: APPROVED

## Findings

### Critical

Нет.

### Warning

- **[module.ts:55-57]**: В `runtime` экспортируется только `stats`; поля `isInitialized` и `settingsCount` из bullet requirements §5 (`swimlane-wip-limits-module`) и target-design не включены.
  - Контекст: pseudocode §5 для фичи содержит только `stats: BoardRuntimeModel.stats`; `settingsCount` в кодовой базе модуля отсутствует (нет геттера/поля в `BoardRuntimeModel`).
  - Предложение: добавить в `runtime` как минимум `isInitialized: boardRuntimeModel.isInitialized`; для `settingsCount` — вычислять read-only (например `Object.keys(propertyModel.settings).length`) или завести getter на модели; обновить assert в `module.diagnostic.test.ts`.

- **[module.diagnostic.test.ts]**: Нет проверки, что callback не вызывает `propertyModel.load()` / `boardRuntimeModel.calculateStats()` (side-effect free — requirements §5.2).
  - Предложение: `vi.spyOn(propertyModel, 'load')` и `vi.spyOn(boardRuntimeModel, 'calculateStats')` перед `collectDiagnosticReport()`, `expect(...).not.toHaveBeenCalled()`. Тест уже проверяет `render()` — хорошо; дополнить симметрично column-limits/person-limits рекомендациям из REVIEW-TASK-102/103.

### Nit

- **[module.diagnostic.test.ts]**: Нет сценария `propertyModel` в состоянии ошибки (`state: 'error'`, `error: '...'`).
  - Предложение: отдельный `it` с установкой `propertyModel.state` / `propertyModel.error` и проверкой snapshot «as-is».

- **[requirements §5 bullet vs pseudocode]**: Bullet требует meta про legacy-read `jiraHelperWIPLimits`; callback отдаёт только `state`/`error`/`settings` без явной legacy-meta.
  - Замечание: для triage merge/load обычно достаточно `settings`; meta можно добавить позже, если понадобится в support.

## Соответствие TASK и §5.3

| Критерий | Статус |
|----------|--------|
| `featureName` = `swimlane-wip-limits-module` | ✅ |
| Регистрация в `register()`, inject `diagnosticModelToken`, `propertyModelToken`, `boardRuntimeModelToken` | ✅ |
| Payload convention §5.3: `{ settings: { boardProperty, localStorage }, runtime }` | ✅ |
| `settings.boardProperty`: `{ state, error, settings }` (bullet §5) | ✅ |
| `localStorage: null` | ✅ |
| Callback sync, `Ok(...)`, без `load()`/`render()`/`calculateStats()` в теле | ✅ |
| `getDiagnosticSnapshot()` не потребовался — прямое чтение `stats` безопасно | ✅ |
| Unit test diagnostic callback | ✅ (3 теста) |
| `module.test.ts`: `diagnosticModule.ensure` в `beforeEach` | ✅ |

## Архитектура и границы модулей

- Импорты из `diagnostic-module`: только `diagnosticModelToken` и type `FeatureDiagnosticData` — по developer-guide / module-boundaries ✅
- Порядок bootstrap в тесте: `diagnosticModule.ensure` → `swimlaneWipLimitsModule.ensure` — зеркалит `content.ts` ✅
- Изменения в scope TASK (`module.ts`, `module.diagnostic.test.ts`, правка `module.test.ts`) ✅
- Паттерн closure над `propertyModel` + `boardRuntimeModel` совпадает с `column-limits-module` ✅

## REQUIREMENTS_GAP

Расхождение артефактов: **bullet** requirements §5 и **target-design** перечисляют runtime-поля `isInitialized`, `stats`, `settingsCount`, тогда как **pseudocode** §5 и реализация TASK-104 отдают только `{ stats }`. Поле `settingsCount` в `BoardRuntimeModel` не существует. Рекомендация для EPIC: зафиксировать канонический runtime-snapshot (добавить поля в pseudocode/реализацию или сузить bullet).

## Резюме

Реализация закрывает TASK-104 и convention §5.3: корректное имя фичи, регистрация callback в `register()`, read-only snapshot property/runtime без side effects, три unit-теста (регистрация, loaded state, initial state), проверка JSON-serializable и отсутствия вызова `render()`. Замечания по `isInitialized`/`settingsCount` и spy на `load()`/`calculateStats()` — улучшения согласованности с requirements, не блокеры. Блокирующих проблем нет.
