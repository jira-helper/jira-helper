# QA: TASK-66 — Sub-Tasks Runtime Progress Mapping

**Дата**: 2026-04-28
**TASK**: [TASK-66](./TASK-66-subtasks-runtime-progress-mapping.md)
**Вердикт**: PASS

## Автоматические проверки


| Проверка      | Результат | Детали                                                                                                                            |
| ------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Focused tests | pass      | `npm test -- --run src/features/sub-tasks-progress/IssueCardSubTasksProgress/hooks/useSubtasksProgress.test.tsx` — 4 tests passed |
| TypeScript    | pass      | `npm run lint:typescript`                                                                                                         |
| ESLint        | pass      | `npm run lint:eslint -- --fix`                                                                                                    |
| Tests         | pass      | `npm test` — 131 files passed, 1433 tests passed                                                                                  |
| Build         | pass      | `npm run build:dev`                                                                                                               |


## Проектные требования


| Проверка      | Результат | Комментарий                       |
| ------------- | --------- | --------------------------------- |
| i18n          | N/A       | Runtime-only changes.             |
| Accessibility | N/A       | No UI changed for this task.      |
| Storybook     | N/A       | No stories changed for this task. |


## Проблемы

Нет.

## Резюме

Sub-tasks runtime now applies custom progress buckets by status id while preserving default Jira category behavior and existing blocked overrides.