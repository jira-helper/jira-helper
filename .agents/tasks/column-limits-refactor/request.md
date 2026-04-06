# Рефакторинг column-limits: zustand → valtio + PageObject

**Дата**: 2026-04-05

## Запрос

Рефакторинг модуля `src/column-limits` для соответствия best practices проекта:

1. **Отказ от zustand+actions в пользу valtio** — три zustand-стора (`useColumnLimitsPropertyStore`, `useColumnLimitsRuntimeStore`, `useColumnLimitsSettingsUIStore`) + отдельные action-файлы заменяются на valtio Model-классы по образцу `src/swimlane-wip-limits/` и `src/features/field-limits/`.

2. **Ликвидация `ColumnLimitsBoardPageObject` как PageObject** — текущий `ColumnLimitsBoardPageObject` — это лишняя сущность. Логика DOM-работы с бейджами и подсчётом issue должна быть в `BoardPagePageObject` (или выделена в отдельный сервис/helper, но не как PageObject). Нужно определить, что из функций ColumnLimitsBoardPageObject уже покрывается BoardPagePageObject, а что нужно вынести.
