# QA: TASK-96 — Migrate diagnostic → diagnostic-module folder

**Дата**: 2026-05-19
**TASK**: [TASK-96](./TASK-96-migrate-diagnostic-module-folder.md)
**Вердикт**: PASS

## Структурная проверка (миграция)

| Проверка | Результат |
|----------|-----------|
| `src/features/diagnostic/` удалена | pass |
| `src/features/diagnostic-module/` существует | pass |
| Перенесённые файлы | `BoardPage.ts`, `SettingsTab.tsx`, `JqlDebugDemo.tsx`, `JqlDebugDemo.stories.tsx`, `actions/saveDiagnosticData.ts` |
| `src/content.ts` импорт из `diagnostic-module` | pass — `./features/diagnostic-module/BoardPage` |
| Старые импорты `features/diagnostic` (без `-module`) | pass — не найдены в `src/` |

## Автоматические проверки

| Проверка | Результат | Детали |
|----------|-----------|--------|
| ESLint | pass | `npm run lint:eslint -- --fix`, exit 0. Лог: `.logs/qa-task-96-eslint.log` |
| Tests | pass | 153 files, 1673 tests passed (~25.4s). Лог: `.logs/qa-task-96-npm-test.log` |
| Build | pass | `npm run build:dev`, `✓ built in 8.19s`. Лог: `.logs/qa-task-96-build-dev.log` |

## Проектные требования

| Проверка | Результат | Комментарий |
|----------|-----------|-------------|
| i18n | pass (minimal) | `JqlDebugDemo.tsx` — локальный `TEXTS` en/ru + `useGetTextsByLocale`. `SettingsTab.tsx` — legacy hardcoded EN (без изменений по смыслу задачи; вне scope рефакторинга папки). |
| Accessibility | pass (minimal) | Поведение перенесено без изменений UI; отдельных регрессий a11y по diff не ожидается. |
| Storybook | pass (minimal) | `JqlDebugDemo.stories.tsx` перенесён; Storybook не запускался (механическая миграция). |

## BDD / Change Control

Отдельных `.feature` сценариев для diagnostic/diagnostic-module в репозитории не найдено. Для TASK-96 (перенос папки) пробел в BDD-покрытии не выявлен — **MISSED_SCENARIO не применяется**.

## Проблемы

Нет.

## Резюме

Миграция в `diagnostic-module` завершена: старая папка удалена, импорты в `content.ts` обновлены. ESLint, Vitest и `build:dev` проходят успешно.
