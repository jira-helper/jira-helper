# Review: TASK-102 — column-limits-module diagnostic

**Дата**: 2026-05-20
**TASK**: [TASK-102-column-limits-diagnostic.md](./TASK-102-column-limits-diagnostic.md)
**Вердикт**: APPROVED

## Findings

### Critical

Нет.

### Warning

- **[module.ts:48-50]**: В `runtime` экспортируется только `groupStats`; поле `cssNotIssueSubTask` из `BoardRuntimeModel` не включено.
  - Контекст: в requirements §5 (bullet для `column-limits-module`) и target-design (таблица источников) явно указаны `groupStats` и `cssNotIssueSubTask`; pseudocode-блок §5 и [developer-guide.md](./developer-guide.md) содержат только `groupStats`.
  - Предложение: добавить `cssNotIssueSubTask: boardRuntimeModel.cssNotIssueSubTask` в `runtime` и assert в тесте — для согласованности с bullet requirements и упрощения triage расхождений подсчёта задач (фильтр sub-task).

- **[module.diagnostic.test.ts]**: Нет проверки, что callback не вызывает `propertyModel.load()` / `boardRuntimeModel.calculateStats()` (side-effect free — requirements §5.2).
  - Предложение: `vi.spyOn(propertyModel, 'load')` и `vi.spyOn(boardRuntimeModel, 'calculateStats')` перед `collectDiagnosticReport()`, expect not called.

### Nit

- **[module.diagnostic.test.ts]**: Нет сценария `propertyModel` в состоянии ошибки (`state: 'initial'`, `error: '...'`) — полезный edge из requirements §5.2 / developer-guide «export as-is».
  - Предложение: отдельный `it` с установкой `propertyModel.error` и проверкой snapshot.

- **[module.ts:41-45]**: `settings.boardProperty` — объект `{ state, error, data }`, а не только `data` как в примере developer-guide.
  - Замечание: это **соответствует** тексту requirements §5 («читает `state`, `error`, `data`»); расхождение только с примером в guide — guide можно обновить отдельно.

## Соответствие TASK и §5.3

| Критерий | Статус |
|----------|--------|
| `featureName` = `column-limits-module` | ✅ |
| Регистрация в конце `register()`, inject `diagnosticModelToken`, `propertyModelToken`, `boardRuntimeModelToken` | ✅ |
| Payload convention §5.3: `{ settings: { boardProperty, localStorage }, runtime }` | ✅ |
| `localStorage: null` | ✅ |
| Callback sync, `Ok(...)`, без `load()`/`calculateStats()` в теле | ✅ |
| Unit test diagnostic callback | ✅ (3 теста) |
| `npm test` (module.diagnostic.test.ts) | ✅ |
| ESLint (module.ts, module.diagnostic.test.ts) | ✅ |

## Архитектура и границы модулей

- Импорты из `diagnostic-module`: только `diagnosticModelToken` и type `FeatureDiagnosticData` — по developer-guide / module-boundaries ✅
- Порядок bootstrap в тесте: `diagnosticModule.ensure` → `columnLimitsModule.ensure` — зеркалит `content.ts` ✅
- Изменения только в scope TASK (module + test), без лишнего рефакторинга ✅

## REQUIREMENTS_GAP

Расхождение внутри артефактов фичи: **bullet** requirements §5 и **target-design** требуют отдавать `cssNotIssueSubTask` в runtime snapshot, тогда как **pseudocode** §5, **developer-guide** и реализация TASK-102 включают только `groupStats`. Рекомендация для EPIC: зафиксировать один канонический список runtime-полей (добавить `cssNotIssueSubTask` в pseudocode или снять из bullet).

## Резюме

Реализация закрывает TASK-102 и convention §5.3: корректное имя фичи, регистрация callback в `register()`, read-only snapshot property/runtime, три осмысленных unit-теста (регистрация, loaded state, initial state), JSON-serializable payload. Единственное существенное замечание — опциональное поле `cssNotIssueSubTask` из-за неоднозначности docs; блокирующих проблем нет.
