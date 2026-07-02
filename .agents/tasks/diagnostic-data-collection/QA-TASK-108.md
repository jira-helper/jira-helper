# QA: TASK-108 — wiplimit-on-cells + charts-add-sla-line diagnostic

**Дата**: 2026-05-20 (повтор после flaky fixes)
**TASK**: [TASK-108](./TASK-108-wiplimit-cells-sla-diagnostic.md)
**Вердикт**: PASS

## Автоматические проверки

| Проверка | Результат | Детали |
|----------|-----------|--------|
| ESLint | pass | `npm run lint:eslint`, exit 0. Лог: `.logs/qa-task-108-109-lint-eslint.log` |
| TypeScript | fail (repo) | `npm run lint:typescript`, exit 2 — 12 ошибок в других модулях epic (field-limits, person-limits, sub-tasks, swimlane); **файлы TASK-108 без ошибок**. Лог: `.logs/qa-task-108-109-lint-typescript.log` |
| Tests | pass | `npm test`: 166 files, **1729 passed**, exit 0 (~272s). Лог: `.logs/qa-task-108-109-npm-test.log` |
| Build | pass | `npm run build:dev`, `✓ built in 23.63s`, exit 0. Лог: `.logs/qa-task-108-109-build-dev.log` |

**Scope TASK-108**: `npx vitest run src/features/wiplimit-on-cells/diagnosticRegistration.test.ts src/features/charts/diagnosticRegistration.test.ts` — 2 files, **6 tests**, exit 0. Лог: `.logs/qa-task-108-scope.log`

## Проектные требования

| Проверка | Результат | Комментарий |
|----------|-----------|-------------|
| i18n | pass | Diagnostic wiring / snapshots; новых пользовательских строк в UI нет |
| Accessibility | pass | UI не затронут |
| Storybook | N/A | Новых View-компонентов нет |

## Соответствие критериям TASK-108

| Критерий | Результат |
|----------|-----------|
| featureName `charts-add-sla-line` (kebab, §5.4) | pass |
| wiplimit-on-cells cached `wipLimitCells` snapshot | pass — 3 теста |
| charts SLA config snapshot `slaConfig3` | pass — 3 теста |
| Unit test per callback | pass — 6/6 scope |
| `npm test` (полный suite) | pass — ранее падавшие CommentTemplatesSettings / GanttSettingsModal тесты зелёные |
| `npm run lint:eslint` | pass |

## Резюме

После исправления flaky timeouts полный `npm test` и dev build проходят. Diagnostic callbacks для `wiplimit-on-cells` и `charts-add-sla-line` подтверждены scope-тестами (6/6). Критерии приёмки TASK-108 выполнены — **PASS**. Отдельно: общий `tsc --noEmit` по репозиторию всё ещё падает на соседних diagnostic-задачах epic (не блокирует вердикт по файлам TASK-108).
