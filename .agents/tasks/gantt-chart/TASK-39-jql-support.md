# TASK-39: JQL mode не работает в исключениях и color rules

**Статус**: VERIFICATION
**Тип**: bugfix
**Приоритет**: high

## Описание
`isExcludedByFilter` при `mode === 'jql'` возвращает `false` (no-op).
`matchColorRule` при `mode === 'jql'` делает `continue` (skip).
Нужно реализовать client-side JQL матчинг через `parseJql` из `src/shared/jql/simpleJqlParser.ts`.

## Файлы
- `src/features/gantt-chart/utils/computeBars.ts`
- `src/features/gantt-chart/utils/computeBars.test.ts`
